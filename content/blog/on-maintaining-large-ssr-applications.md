+++
title = "On maintaining large SSR applications"
date = "2026-03-11T11:08:32-03:00"
ToC = "true"

description = "A collection of insightful talks and essays about maintaining large applications"

tags = ["api","english",]
+++

A collection of insightful talks and essays about maintaining large applications.

The focus is mainly traditional SSR web applications using MVC~esque framesworks (such as Django, RoR, Laravel, ...), meaning that if you are focused on frontend only applications (such as SPAs using React, Vue, etc) this probably won't be very helpful :).

## Django structure for scale and longevity

<small>Reference: <https://www.youtube.com/watch?v=yG3ZdxBb1oo></small>

### Where do we put the business logic?

What is "business logic"?

- Every logic in the code base that is not related to the framework infrastructure or some sort of utility.
- Every `if` statement that isn't guessing configuration or concatenating strings.

### Models

They define the relations to be used in the "business logic". Initial business logic can be written in model validation or added in the `save` or `clean` methods.

- It's ok to define model properties based on existing model fields
- It's ok to have additional validation on the clean method
- It's **not** ok to have logic that depends on external factors outside from model relationships

**BUT** models take care primarily of the data model & relations. Avoid fat models!

### Views & APIs

They call code from the core of the application.

(DRF specific)

Serializers should:

- Transform Python / ORM objects to JSON
- Transform JSON to Python data / ORM
- **not** take care of creating objects & doing additional business logic

What about in the APIVIew?

```python
class EntityCreateAPI(APIView):
    def post(self, request):
        serializer = ...
        serializer.is_valid(...)


        # bunch of business logic

        return Response(status=...)
```

But what if we need the same logic elsewhere? For example in a command, in another API path, in a regular view?

### Existing boxes (from Django)

- Models
- Views / APIs
- Templates
- Forms / Serializers
- Tasks

None are great places to put business logic at.

### Services

app/services.py or multiple files at app/services/...py

- General unit that holds business logic together.
- Service is a simple, type annotated function
- Speaks the domain language of the software that we are creating
- Works mostly & mainly with models


Example:

```python
def create_user(
    *,
    email: str,
    name: str
) -> User:
    user = User(email=email)
    user.full_clean()
    user.save()

    create_profile(user=user, name=name)
    send_confirmation_email(user=user)

    return user
```

Every non-trivial operation, where objects are being created, should be a service.

```python
@transaction.atomic
def create_complex_thing_with_dependences():
    ...
    # does a bunch of database creating
```

No ORM code in the view layer! Not in the viewset, not in the APIView.

### Selectors

- Take care of business logic around fetching data from the DB
- Not always necessary
- Can handle permissions, filtering, etc

```python
def get_users(*, fetched_by: User) -> Iterable[User]:
    user_ids = get_visible_users_for(user=fetched_by)

    query = Q(id__in=user_ids)

    return User.objects.filter(query)
```

### Selectors vs Model properties

If a model property starts doing queries on the model's relations, or outside them, it should be a selector.

Example (better as a selector):

```python
class Lecture(models.Model):
    ...
    course = models.ForeignKey(Course, ...)
    ...
    @property
    def not_present_students(self):
        present_ids = self.present_students.values_list('id', flat=True)

        return self.course.students.exclude(id__in=present_ids)
```

If we are listing all `Lecture`s, this can easily become a n+1 problem (for every lecture, we need to query all course students). So this should probably be moved into a selector.

### APIs

- When using services & selectors, all APIs look the same
- Nice repeatable pattern for how an API should look like
- API layer is easily tested

Example:

```python
class CourseListApi(AuthMixin, APIView):
    class OutputSerializer(serializers.ModelSerializer):
        class Meta:
            model = Course
            fields = ('id', 'name', 'start_date', 'end_date')

    def get(self, request, course_id):
        course = get_couse(id=course_id)
        data = self.OutputSerializer(course)
        return Response(data)

class CourseCreateApi(AuthMixin, APIView):
    class InputSerializer(serializers.Serializer):
        name = serializers.CharField()
        start_date = serializers.DateField()
        end_date = serializers.DateField()

    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        create_course(**serializer.validated_data)

        return Response(status=status.HTTP_201_CREATED)
```

### APIs - Serializers

- Serializers are nested inside the API
- for list / detail API, you can use ModelSerializer if needed
- if you are doing create / update API, you can use the normal serializer
- Output serializers can be reutilized with great attention
- Input serializers should be unique to each route

### Testing models

If there is no complex logic on the model methods, tests don't actually need to touch the database. Test custom validation logic.

### Testing services

- The most important layer to be tested
- Mock integration between different services

### Testing APIs

- Can be done by mocking the services and selectors or
- Delegate to integration tests, since we are only really serializing input/output

### TL;DR

Avoid business logic in

- Model's save method
- Forms & Serializers
- Views & APIs
- Templates, tags and utility method (these should be as close to pure functions as possible)
- Tasks

Selectors & Services:

- Use services for create/update actions
- Use selectors for get/list actions

### Follow up talks

On separation of concerns and identifying boundaries in the system: [Ruby Conf 12 - Boundaries by Gary Bernhardt](https://www.youtube.com/watch?v=yTkzNHF6rMs).

On testing: [Proper Django Testing by Martin Angelov](https://www.youtube.com/watch?v=NHhnEa5CyHk)

## Boundaries

<small>Reference: https://www.youtube.com/watch?v=yTkzNHF6rMs</small>

Testing in isolation involves mocking everything that interacts with the feature under test.

### Mocking can be deceitful

There are three main advantages to mocking/stubbing:

- Allows for **Test-Driven Design** (features can evolve based on a set of passing conditions)
- Allows for **Outside-in Test-Driven Development**, where the most important feature can be developed before the lower level implementations: for example the rules of a notification system can be implemented without a working messaging system
- Great test performance (quick tests)

Which are balanced out by the drawback of testing your implementation in a fake ecosystem: with mocking you can never be 100% sure that your mocks are modeling the system in a reliable way.

This creates situations where tests pass but the system breaks under the tested conditions.

### How to reduce the problem

There are multiple approachs to making mock and stub design more reliable.

#### Contract & Collaboration tests

This involves another layer of testing: we try to guarantee that our testing doubles (mocks and stubs) are reproducing the expected behaviour.

> Contract and Collaboration tests are medium sized tests that validate how one's own code interacts with an external dependency. Internal APIs are adapters that insulate most of your code from changes in such dependencies. ([Mike Bland - Contract/Collaboration Tests and Internal APIs](https://mike-bland.com/2023/09/08/contract-collaboration-tests-and-internal-apis.html))

This valid alternative reinforces the definition of interfaces, both for internal and external dependencies, with the downside of increasing codebase complexity and adding additional layers of indirection.

#### The tools approach

In the ruby ecosystem there's [rspec-fire](https://github.com/xaviershay/rspec-fire) that attempts to validate that mocked contracts (such as method or returned values) are in accord to the real implementations.

Python has something similar with unittest.mock's `create_autospec`, but it only validates that the mocked method exist, not their returned values.

#### Typing

By subclassing the mock from the real class, we can enforce type safety and statically catch both invalid methods and invalid return types.

#### Integration testing

See [Integrated Tests Are A Scam by J.B. Rainsberger](https://www.youtube.com/watch?v=fhFa4tkFUFw&t=13s). But seriously the thing is that integrated tests probably do not cover your codebase throughly enough, and you still need unit tests.

### How to not need mocks

If a function has no side effects, meaning it receives a value, manipulates it, and returns a new value, and it has no dependencies, then we don't need to mock anything.

How can we modify existing code to approach this theoretical function?

By using **Values as Boundaries**.

Compare this initial implementation:

```python
class Sweeper:
    def sweep(self):
        for user in User.objects.all():
            if user.active and user.paid_at < datetime.now() - timedelta(30):
                UserMailer.billing_problem(user)


@fixture
def bob():
    # in librarires such as factory boy, .create() instantiates a python
    # object and saves it to the database
    return UserFactory(active=True, paid_at=datetime.now() - timedelta(60)).create()


@mark.describe("Sweeper")
class TestSweeper:
    @mark.context("When a subscription is expired")
    @mark.it("emails the user")
    def test_emails_users_with_expired_subs(self, bob, mocker):
        billing_problem_mock = mocker.patch("UserMailer.billing_problem", return_value=None)
        sweeper = Sweeper()
        sweeper.sweep()
        billing_problem_mock.assert_called_once_with(bob)
```

To this modified version:

```python
class ExpiredUsers:
    def for_users(self, users):
        expired = []
        for user in users:
            if user.active and user.paid_at < datetime.now() - timedelta(30):
                expired.append(user)
        return expired


class Sweeper
    def sweep(self):
        expired_users = ExpiredUsers()
        for user in expired_users.for_users(User.objects.all()):
            UserMailer.billing_problem(user)


@fixture
def bob():
    # .build() should instantiate the python object without
    # saving to the database
    return UserFactory(active=True, paid_at=datetime.now() - timedelta(60)).build()

@mark.describe("ExpiredUsers")
class TestExpiredUsers:
    @mark.context("When a list of users is received")
    @mark.it("returns the ones that are expired")
    def test_emails_users_with_expired_subs(self, bob):
        expired_users = ExpiredUsers()
        assert expiredUsers.for_users([bob]) == [bob]


@mark.describe("Sweeper")
class TestSweeper:
    @mark.context("When a subscription is expired")
    @mark.it("emails the user")
    def test_emails_users_with_expired_subs(self, bob):
        mocker.patch("ExpiredUsers.for_users", return_value=[bob])
        billing_problem_mock = mocker.patch("UserMailer.billing_problem", return_value=None)

        sweeper = Sweeper()
        sweeper.sweep()
        billing_problem_mock.assert_called_once_with(bob)
```

While we still need to use a mock, we have a much clearer separation of concerns.

The `ExpiredUsers` class has a pure method (no side effects, no dependency on external state). The `Sweeper` class is now responsible for managing the dependencies.

In a way, the `Sweeper` class is an orchestration layer (imperative shell) around a logical layer (the functional core).

The **Core** should be **heavy on paths** (possible code outcomes, `if`s, etc) and **light on dependencies**, meaning it is more **easily isolated**.

The **Shell** should be the oposite, **heavy on dependencies** and **light on paths**, which makes it a great contender for integration testing.

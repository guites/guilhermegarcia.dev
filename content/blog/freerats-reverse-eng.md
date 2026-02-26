+++
title = "FreeRats: eng reversa da API do GymRats"
date = "2026-02-25T15:52:19-03:00"
description = "Processo de engenharia reversa utilizado para automatizar o download dos dados de checkin realizados no aplicativo GymRats"
toc = true
draft = false

tags = ["português","api", "reverse-engineering", "mobile", "cli"]
+++

<img src="https://i.ibb.co/WpVV229G/rat.jpg" alt="Do your part, reverse eng a rat. fight for data ownership on the mobile ecosystem" border="0">

Escuta, eu quero usar apps sociais pra me manter engajado e acompanhar meus amigos. Mas são **meus dados** e o mínimo que eu espero é uma forma automatizada de extrair eles.

Enquanto o GymRats tem uma funcionalidade muito boa de exportar um arquivo .json com os dados de utilização, ele só permite acesso via aplicativo.

Como não existe uma versão web onde eu possa inspecionar as requisições com o devtools (e automatizar o export dos meus dados com um ou dois `curl`s via linha de comando), tive que mergulhar de cabeça no labirinto que é mapeaer as requisições feitas por um aplicativo Android.

**tldr**: consegui montar as requisições necessárias para fazer login e extrair o .json com os dados pessoais. [Clique aqui para ver o fluxo completo](#script-com-o-fluxo-completo).

## Primeira tentativa: HTTP Toolkit

Fiz a instalão do HTTP Toolkit no meu Ubuntu através do arquivo .deb, e depois, [seguindo esse tutorial](https://httptoolkit.com/docs/guides/android/), subi o HTTP Toolkit como um VPS. 

Pelo celular, fiz a conexão pela leitura do QRCode, que me instruiu a instalar o aplicativo. Patinei um pouco (o celular dizia que não conseguia estabelecer conexão com o computador) até me dar conta de que o Ubuntu vem com a porta 8000 fechada, então o celular não conseguia conversar com o computador mesmo estando na mesma rede.

Consegui resolver com um `sudo ufw enable 8000`; lembre-se de fechar a porta ao sair com `sudo ufw disable 8000`.

Consegui interceptar o tráfego, mas o app do GymRats não aceita certificados SSL auto assinados (que é o caso do cert usado pelo VPS do HTTP Toolkit), então as requisições acabavam sendo abortadas, e eu não conseguia ver nem as URLs acessadas pelo painel do toolkit.

Existem [formas de burlar essa restrição](https://httptoolkit.com/docs/guides/android/#intercepting-traffic-from-3rd-party-android-apps), mas elas envolvem fazer root no celular (não quero) ou usando emuladores.

## Segunda tentativa: análise estática

Buscando no [apkpure](https://apkpure.com) consegui um arquivo .xapk do GymRats.

Usei o `strings` pra fazer uma análise inicial no arquivo, e achei alguns resultados, mas eram majoritariamente URLs fixas tipo android.googlesource.com e w3.org:

```
$ strings "gymrats.xapk" | grep -iE "http|https"
Android (12027248, +pgo, +bolt, +lto, +mlgo, based on r522817) clang version 18.0.1 (https://android.googlesource.com/toolchain/llvm-project d8003a456d14a3deb8054cdaa529ffbf02d9b262)
http://www.w3.org/2000/xmlns/
http://www.w3.org/XML/1998/namespace
http://ns.adobe.com/xap/1.0/
xml=http://www.w3.org/XML/1998/namespace
IEC http://www.iec.ch
IEC http://www.iec.ch
# ... um monte de coisa que eu não tô mostrando aqui
https://github.com/react-native-community/cli/blob/master/docs/autolinking.md
okhttp3/internal/publicsuffix/NOTICEM
okhttp3/internal/publicsuffix/publicsuffixes.gz
,,https://gymrats-1549569453212.firebaseio.com
okhttp3/internal/publicsuffix/NOTICEPK
okhttp3/internal/publicsuffix/publicsuffixes.gzPK
```

Uma URL me chamou a atenção, <https://gymrats-1549569453212.firebaseio.com>, e de fato ela redireciona pra um [console do firebase](https://console.firebase.google.com/project/gymrats-1549569453212/database/gymrats-1549569453212/data/), mas não tem como saber se ele existe ou se eu não tenho permissão.

O arquivo .xapk é um container (tipo um .zip) e pode ser extraído:

```
$ unzip gymrats.xapk -d app_extracted
...
$ ls app_extracted
com.hasz.gymrats.app.apk
config.ar.apk
config.arm64_v8a.apk
config.de.apk
config.en.apk
config.es.apk
config.fr.apk
config.hi.apk
config.in.apk
config.it.apk
config.ja.apk
config.ko.apk
config.my.apk
config.pt.apk
config.ru.apk
config.th.apk
config.tr.apk
config.vi.apk
config.xxhdpi.apk
config.zh.apk
icon.png
manifest.json
```

Aqui temos o apk de verdade (com.hasz.gymrats.app.apk) e vários arquivos de configuração.

Na análise anterior eu tinha visto algumas urls que indicavam que o app era feito em React Native, e abrindo o .apk deu pra ter uma noção melhor do conteúdo:

```
$ unzip com.hasz.gymrats.app.apk -d base_apk
$ ls base_apk

AndroidManifest.xml                        play-services-ads-api.properties
androidsupportmultidexversion.txt          play-services-ads-identifier.properties
assets                                     play-services-ads.properties
billing.properties                         play-services-appset.properties
classes2.dex                               play-services-auth-api-phone.properties
classes3.dex                               play-services-auth-base.properties
classes4.dex                               play-services-auth-blockstore.properties
classes5.dex                               play-services-auth.properties
classes6.dex                               play-services-basement.properties
classes7.dex                               play-services-base.properties
classes8.dex                               play-services-cloud-messaging.properties
classes.dex                                play-services-fido.properties
client_analytics.proto                     play-services-identity-credentials.properties
core-common.properties                     play-services-location.properties
DebugProbesKt.bin                          play-services-maps.properties
firebase-analytics.properties              play-services-measurement-api.properties
firebase-auth-interop.properties           play-services-measurement-base.properties
firebase-encoders.properties               play-services-measurement-impl.properties
firebase-encoders-proto.properties         play-services-measurement.properties
firebase-iid-interop.properties            play-services-measurement-sdk-api.properties
firebase-iid.properties                    play-services-measurement-sdk.properties
firebase-measurement-connector.properties  play-services-stats.properties
googleid.properties                        play-services-tasks.properties
kotlin                                     res
kotlin-tooling-metadata.json               resources.arsc
messaging_event_extension.proto            review-ktx.properties
messaging_event.proto                      review.properties
META-INF                                   stamp-cert-sha256
okhttp3                                    user-messaging-platform.properties
org
```

Ali em assets/ tem o arquivo index.android.bundle, e ele não é um arquivo de texto:

```
$ file base_apk/assets/index.android.bundle
base_apk/assets/index.android.bundle: Hermes JavaScript bytecode, version 96
```

[Hermes](https://reactnative.dev/docs/hermes) é uma engine de javascript usada pra otimizar código React Native. Ele [compila o código para bytecode](https://docs.expo.dev/guides/using-hermes/), o que em termos práticos deixa ele obfuscado. 

Mesmo assim, com o `strings` dá pra ter acesso ao conteúdo, que dessa vez revelou bastante informação sobre a API:

```
$ strings base_apk/assets/index.android.bundle | grep -iE "login|auth|token|session|password|email"
... muito texto

{groupCount} groupsFlipInYLeftFlipOutDataFlipOutYLeft[object Float64Array]Follow your device's settings automatically.FontSlantFontStyle_setUpdatePropsFor example, 3 miles will change to 4.82 km._updateHighlightFor example, 5 miles will change to 5 km._updatePropsFor groups that want stricter accountability with same-day check-ins only, while still allowing for verified library uploads.RNSVGForeignObjectIntlFormatErrorusePrettyFormattedListPartsisUtcOffsetFormattedPluralFree accounts have a maximum group limit of two.Friends leaderboardDescriptionbuildFrom deviceInfoEmitterFull controlEdgeToEdgeValuesGET /account/emailGET /challenges/:challengeId/activity_typesGET /challenges/:challengeId/admin/activity_typesGET /challenges/:challengeId/challenge_settingsGET /challenges/:challengeId/messagesGET /challenges/:challengeId/notification_settingsGET /challenges/:challengeId/scoring_limit_settingsGET /check_in_reviewsGET /personal_goals/:goalId/check_insGET /personal_goals/:goalId/statsContainerGeneralGive the first team a name and an optional team photo. Group members will be able to create their own teams or join an existing one.Give the team a name and an optional team photo.Give your group members daily workout plans.createGoal created.GoalCadenceDetailsScreenGoalDetailsScreenclearGoalFormScreenGoalSettingsScreenGoalTemplatesScreenGoneGravitySensortIndexGray_8Great, I would like to use kilometers.RNSVGGroup admins can now block retroactive posting and prevent using library uploads.Group notificationsGroup settingsGroup statsGridGroupPhotosScreenGrouped activities must be on the same day.HAS_REANIMATED_3HIGHLIGHTMLElementHScrollContentViewNativeComponentHScrollViewNativeComponentMIDNIGHTMLImageElementSCREEN_HEIGHTMLVideoElementHabitDetailsScreenHabitsSectionHard modefaultDrawDistanceHardLightSpeedOutLeftHealth Connect can be <link>downloaded from Google Play</link>.Health Connect is Android's fitness data hub, letting you share workout information between different apps on your phone.

... muito texto
```

Passando o olho por cima notei alguns padrões, como

- GET /account/email
- GET /challenges/:challengeId/activity_types
- GET /challenges/:challengeId/admin/activity_types
- GET /challenges/:challengeId/challenge_settings
- GET /challenges/:challengeId/messages
- GET /challenges/:challengeId/notification_settings
- GET /challenges/:challengeId/scoring_limit_settings
- GET /check_in_reviews
- GET /personal_goals/:goalId/check_ins
- GET /personal_goals/:goalId/statsContainerGeneral

E também em outras partes 

- PUT /account/email_password_sign_interop
- POST /passwords/reset
- POST /token
- POST /accounts/email_confirmation
- POST /account/email/verify
- POST /account_notifications/read

Dá pra refinar buscando pelo padrão `METHOD<ESPAÇO>BARRA`:

```

$ strings base_apk/assets/index.android.bundle | grep -E "GET|POST|PUT|HEAD /"

POST /account/email/verifyConfigMessagesturesToAttachildContextTypesPOST /account_notifications/read_allocateCallbackhand_index_pointing_down-right arrow curving downloadFile: Invalid value for property `background`registerCSSKeyframes` is not available in JSReanimated.POST /accounts/email_confirmationPOST /accounts/sign_interopRequireDefault settingsPOST /challenges/:challengeId/admin/activity_types/:activityTypeId/enablementionPickerContainerPOST /challenges/:challengeId/admin/common_activities/:platform_category_id/enablementionQueryPOST /challenges/:challengeId/messages/:messageId/reactionsLeftPOST /check_in_reviews/:workoutId/approverEvery time you perform a Fitbit activity, it will automatically be recorded as a check-in.POST /eventsullii {{count}} vahkurang dari {{count}} saattachHandlersPOST /feedbackspace-around-people wrestlingetEventPhaselectedTimelinePOST /media_contentAvailablePOST /membership_requestsulq54POST /membershipstereactNativeReanimated_EasingTs21FactoryPOST /passwords/resetHooksOnUnwind_chimenys de {{count}} segonsupportsResourcesPOST /personal_goals_enabledPOST /profile/stats/activity_time_seriesun behind cloud with lightning and rainitialSafeAreaInsetsContextShadowOffsetDefaultOptionsPOST /profile/stats/overviewCardPOST /profile/stats/time_seriesun behind large cloud with rainitialScrollIndexParamsPOST /tokensureRootIsScheduled workoutsPOST to bottom leftActionTranslatePPPP proksimume 1 jaroundToDecimalPlacesALLOWED_PROPS4PT0SOON arrowIndexPUT /account/email_password_sign_interopRequireWildcard file boxing glovestatusLabelTextPUT /challenges/:challengeId/admin/challenge_settingsun behind rain cloud with snow-capped mountain cablewayPUT /challenges/:challengeId/admin/scoring_limit_settingsun behind small cloud_with_lightning_and_rainitialTimelineBottomSheetGestureHandlersContextInputContainerPUT /challenges/:challengeId/admin/verification_settingsun with facePUT /challenges/:challengeId/notification_settingsun.PUT /personal_goals/:goalId

GET /account_settingsUpdatesflag_thailandroid.permission.WRITE_EXTERNAL_STORAGET /bests/activity/days of the monthIndex^AGET /bests/habitsGrid^MGET /bests/metrics/check_ins_counterclockwise arrows buttonflag New Zealandroid.permission.READ_CALL_LOGET /bests/metrics/daily-streak-detailshowPaywallflag_scotlandroid.permission.WRITE_CALL_LOGET /bests/streaksGridANIMATION_EASINGET /challenges/:challengeId/verification_settingslipperson golfingetFindAllNodesFailureDescriptionBASE_PROPERTIES_CONFIGET /platform_activitiesTyperson_tipping_handleLayoutTransitionPROCESSING_INSTRUCTION_NODEFAULT_DYNAMIC_SIZINGET /posestd.DEFAULT_ENABLE_OVER_DRAGET /profile/check_installSetStateHooksDEFAULT_INTL_CONFIGET /profile/current_streakDescriptionEndedDailySingularDGET /profile/my_activitieslint-plugin-standard_verificationDOCUMENT_POSITION_FOLLOWINGET /profile/streaks/monthly/:streakType/check_instantCLOSEPARENDINGET /workouts/:workoutId

GET /challenges/:challengeId/members

DELETE /workouts/:workoutId
POST /account_notifications/batch_delet
GET /platform_categories
GET /bests/check_ins/count
```

Também consegui algumas URLs que podem ser a API acessada pelo app:

```
$ strings base_apk/assets/index.android.bundle | grep -oE "https?://[^\"' ]+" | sort -u

...
https://gym-rats-api-pre-production.gigalixirapp.com
```

Tudo indica que o app conversa com o servidor através de uma API REST bem padronizada, e, com sorte, usa o firebase pra requisições auxiliares ou analytics.

Pra ir mais a fundo, utilizei um [decompiler de Hermes pra javascript](https://github.com/P1sec/hermes-dec) apontando pro index.android.bundle:

```
uv run hbc-decompiler base_apk/assets/index.android.bundle output.js
```

No código gerado eu segui buscando alguns padrões sem muito sucesso, até que um chamou a atenção:

```
grep -n "email" output.js

276283:                            r2['email'] = r1;
276286:                            r1 = 'POST /accounts/email_confirmation';
907338:                r6 = 'POST /accounts/email_confirmation';
907490:                r4 = 'continue_with_email';
907493:                r4 = 'email_password_sign_in';
1173644:                r1 = 'GET /account/email';
1173672:                    r2['email'] = r1;
1173687:                r2 = 'POST /account/email/verify';
1173713:                    r2['email'] = r1;
1173728:                r0 = 'POST /account/email';
1173733:                r5 = 'Your email is essential for account security and recovery.';
1173740:                r1 = 'email';
```

Utilizando o mesmo padrão anterior, aqui os resultados são mais fáceis de entender:

```
$ grep -n "POST /" output.js
232050:                r21 = 'POST /account_notifications/read_all';
232124:                r5 = 'POST /account_notifications/batch_delete';
276286:                            r1 = 'POST /accounts/email_confirmation';
851223:            r2 = 'POST /challenges/:challengeId/messages';
858157:                r12 = 'POST /challenges/:challengeId/messages/:messageId/reactions';
891758:                        r2 = 'POST /media_content';
907338:                r6 = 'POST /accounts/email_confirmation';
907420:                r2 = 'POST /tokens';
908886:                r1 = 'POST /passwords';
909300:            r1 = 'POST /accounts/sign_in';
914300:                r4 = 'POST /feedbacks';
923190:                r4 = 'POST /personal_goals';
971634:                r1 = 'POST /memberships';
971676:                r1 = 'POST /membership_requests';
971684:                r6 = 'POST /events';
978050:                r0 = 'POST /feedbacks';
984300:                r4 = 'POST /profile/stats/overview';
984319:                r0 = 'POST /profile/stats/time_series';
1151264:                r0 = 'POST /passwords/reset';
1156634:            r6 = 'POST /challenges/:challengeId/admin/common_activities/:platform_category_id/enablement';
1156671:            r4 = 'POST /challenges/:challengeId/admin/activity_types/:activityTypeId/enablement';
1159780:                r0 = 'POST /check_in_reviews/:workoutId/approve';
1163208:                r6 = 'POST /profile/stats/overview';
1163239:                r1 = 'POST /profile/stats/time_series';
1163265:                r0 = 'POST /profile/stats/activity_time_series';
1173687:                r2 = 'POST /account/email/verify';
1173728:                r0 = 'POST /account/email';
```

Também tentei buscar alguns prefixos como "/api", "/v1", pra entender melhor a estrutura das URLs:

```
$ grep /api output.js
                r2 = '" as fallback. See https://formatjs.github.io/docs/react-intl/api#intlshape for more details';
            r8 = '/api';
```

Combinando o prefixo /api com as URLs, parece que encontramos algo:

```
$ curl -i -X POST $BASE_URL/api/events
HTTP/2 401
date: Fri, 20 Feb 2026 23:39:15 GMT
content-type: application/json; charset=utf-8
content-length: 74
cache-control: max-age=0, private, must-revalidate
strict-transport-security: max-age=31536000
x-request-id: cec9e5365cd6e35d84b02da3583ef5cf
x-robots-tag: noindex, nofollow

{"error":"Something went wrong. Try signing in again.","status":"failure"}
```

Isso é ótimo: a API parece estar rodando e validando requisições.

Esses dois pareceram promissores: `POST /accounts/sign_in` e `POST /tokens`.

```
$ curl -i -X POST $BASE_URL/api/accounts/sign_in -H "Content-Type: application/json" -d '{"email": "test", "password": "teste"}'
HTTP/2 400
date: Fri, 20 Feb 2026 23:42:12 GMT
content-type: application/json; charset=utf-8
content-length: 13
cache-control: max-age=0, private, must-revalidate
strict-transport-security: max-age=31536000
x-request-id: 518fe1349a6cfbccaf745a5d39b72a1f
x-robots-tag: noindex, nofollow

$ curl -i -X POST $BASE_URL/api/tokens -H "Content-Type: application/json" -d '{"email": "test", "password": "teste"}'
HTTP/2 422
date: Fri, 20 Feb 2026 23:42:47 GMT
content-type: application/json; charset=utf-8
content-length: 80
cache-control: max-age=0, private, must-revalidate
strict-transport-security: max-age=31536000
x-request-id: 7283318362e50beac75ade7a62efb293
x-robots-tag: noindex, nofollow

{"error":"That email and password combination did not work.","status":"failure"}
```

O status `400` indica que eu provavelmente errei o formato do corpo da requisição, enquanto o 422 parece indicar que só falta utilizar um email e senha válidos :).

O problema é que mesmo tentando com um login correto (que eu consigo usar pra acessar pelo app), o erro segue. 

Tentei alguns padrões no código decompilado pra tentar entender como funciona a lógica da página de login:

```
$ grep -n "LoginScreen" output.js
$ grep -n "SignIn" output.js
276079:        r2['useEmailSignIn'] = r0;
276251:        r1 = function() { // Original name: useEmailSignIn, environment: r1
276338:        r2['useEmailSignIn'] = r1;
904299:                    r1 = 'EmailSignInScreen';
907206:        r3 = 'EmailSignInScreen';
907723:                        r1 = 'EmailSignInScreen';
976889:                r1 = 'EmailSignInScreen';
1177255:                        r2 = 'EmailSignInScreen';
1186371:        r1['EmailSignInScreen'] = r3;
```

Parece ter algo em torno da linha 907200:

```
$ sed -n '907200,907600p' output.js
...
                r6 = function(a0, a1) { // Original name: onSuccess, environment: r8
                    r0 = a0;
                    r7 = r0.nonce;
                    r0 = a1;
                    r1 = r0.email;
                    r3 = _closure1_slot0;
                    r4 = _closure1_slot1;
                    r0 = 12;
                    r2 = r4[r0];
                    r0 = undefined;
                    r2 = r3.bind(r0)(r2);
                    r6 = r2.bridge;
                    r5 = r6.setAuth;
                    r2 = 'signIn';
                    r2 = r5.bind(r6)(r7, r2);
                    r2 = 13;
                    r2 = r4[r2];
                    r2 = r3.bind(r0)(r2);
                    r3 = r2.push;
                    r2 = {};
                    r2['email'] = r1;
                    r1 = 'CheckYourEmailScreen';
                    r1 = r3.bind(r0)(r1, r2);
                    return r0;
                };
                ...
                r6 = 'POST /accounts/email_confirmation';
                r21 = r11.bind(r3)(r6, r7);
                var _closure2_slot13 = r21;
                r2 = r4[r2];
                r2 = r1.bind(r3)(r2);
                r7 = r2.useAPIMutation;
                r6 = {};
                r2 = function() { // Environment: r8
```

Essa definição de `r6` chama a atenção, pois junto com o `r0.email` temos a definição de `r0.nonce`.

Isso bate com o fluxo do aplicativo: ao optar por login por e-mail o aplicativo envia um e-mail de confirmação (mesmo que tu já tenha confirmado o e-mail anteriormente). Só depois você passa pra tela de colocar a senha.

Podemos validar que o endpoint de confirmação de e-mail retorna algo:

```
$ curl -s -X POST "$BASE_URL/api/accounts/email_confirmation" \
>   -H "Content-Type: application/json" \
>   -H "Accept: application/json" \
>   -d "{\"email\":\"$LOGIN_EMAIL\"}"
{"data":{"nonce":"Ql1i5Ta-0RI0FBEjZYUTJE_0SVV-taezBH2SfPSEklM"},"status":"success"}
```

<aside class="warning">E de fato eu recebi um e-mail de confirmação</aside>

E tentar enviar essa `nonce` junto com o payload do login:

```
curl -i -X POST $BASE_URL/api/tokens   -H "Content-Type: application/json"   -H "Accept: application/json" \
  -d "{
    \"email\": \"$LOGIN_EMAIL\",
    \"password\": \"$LOGIN_PWD\",
    \"nonce\": \"$NONCE\"
  }"

HTTP/2 422
date: Fri, 20 Feb 2026 23:52:32 GMT
content-type: application/json; charset=utf-8
content-length: 80
cache-control: max-age=0, private, must-revalidate
strict-transport-security: max-age=31536000
x-request-id: 543ca2e5ec2d26f0a1c2125bbca82975
x-robots-tag: noindex, nofollow

{"error":"That email and password combination did not work.","status":"failure"}
```

Porém o problema persiste. Nesse ponto eu tenho duas teorias: ou existem campos a mais que precisam ser enviados ou existe algum tratamento sendo feito no campo da senha.

Olhando mais de perto, a autenticação parece ser delagada a um método `setAuth`:

```
r7 = r0.nonce;
r1 = r0.email;
r6 = r2.bridge;
r5 = r6.setAuth;
r2 = 'signIn';
r2 = r5.bind(r6)(r7, r2);
```

Buscar por `setAuth` no código descompilado não traz nenhuma definição (só atribuições), sempre próximas a atribuição de `bridge`.

Uma `bridge` significa uma conexão entre o código react da aplicação e o código nativo do celular (geralmente Java ou Kotlin).

Isso indica que a camada de autenticação (que define os cabeçalhos, ajusta os tokens, salva os valores recebidos) não vai estar disponível no código javascript.

## Analisando o código fonte do apk

<aside class="warning">Daqui pra frente o código fica bem mais estruturado. Eu recomendo fortemente abrir os arquivos num editor de texto e analisá-los com calma. Mesmo que o jadx falhe em descompilar toda a implementação, geralmente o nome dos métodos e das classes nos dá um bom indicativo do que está sendo feito.</aside>

Usando o [jadx](https://github.com/skylot/jadx):

```
jadx -d out com.hasz.gymrats.app.apk

$ grep -Rl "setAuth" ./out
./sources/com/google/firebase/installations/remote/AutoValue_InstallationResponse.java
./sources/com/google/firebase/installations/remote/InstallationResponse.java
./sources/com/google/firebase/installations/remote/FirebaseInstallationServiceClient.java
./sources/com/google/firebase/installations/local/AutoValue_PersistedInstallationEntry.java
./sources/com/google/firebase/installations/local/PersistedInstallationEntry.java
./sources/com/google/firebase/installations/local/PersistedInstallation.java
./sources/com/google/android/gms/fido/fido2/api/common/PublicKeyCredentialRequestOptions.java
./sources/com/google/android/gms/fido/fido2/api/common/PublicKeyCredentialCreationOptions.java
./sources/com/google/android/gms/fido/fido2/api/common/PublicKeyCredential.java
./sources/com/hasz/gymrats/app/foundation/AppViewModel.java
./sources/com/hasz/gymrats/app/domain/widget/RatWidget.java
./sources/com/hasz/gymrats/app/domain/fitbit/FitbitConnectionViewModel.java
./sources/com/hasz/gymrats/app/domain/rat_pack/social_links/SocialLinkSettingsViewModel.java
./sources/com/hasz/gymrats/app/domain/react_native/GymRatsBridge.java
./sources/com/hasz/gymrats/app/service/PushNotificationService.java
./sources/androidx/core/app/NotificationCompat.java
./sources/androidx/core/app/NotificationCompatBuilder.java
./sources/androidx/biometric/BiometricViewModel.java
./sources/androidx/biometric/BiometricFragment.java
./sources/androidx/credentials/playservices/controllers/CreatePublicKeyCredential/PublicKeyCredentialControllerUtility.java
./sources/androidx/credentials/provider/BeginGetCredentialResponse.java
./sources/androidx/credentials/webauthn/PublicKeyCredentialCreationOptions.java
./sources/androidx/credentials/webauthn/AuthenticatorAssertionResponse.java
./sources/androidx/constraintlayout/core/widgets/analyzer/WidgetGroup.java
./sources/okhttp3/OkHttpClient.java
./resources/assets/index.android.bundle
```

Focando no código próprio da aplicação (não libs externas), temos o `./sources/com/hasz/gymrats/app/domain/react_native/GymRatsBridge.java`:


```
@ReactMethod(isBlockingSynchronousMethod = true)
public final String setAuth(String nonce, String verificationType) {
    Intrinsics.checkNotNullParameter(nonce, "nonce");
    Intrinsics.checkNotNullParameter(verificationType, "verificationType");
    this.authLinkService.setVerificationType(AuthLinkService.VerificationType.INSTANCE.fromRawValue(verificationType));
    this.authLinkService.setNonce(nonce);
    return "ok";
}
```

Aqui aparece o "nonce" que recebemos na requisição do e-mail, e um novo parâmetro `verificationType`.

Após a validação, a classe `authLinkService` salva o valor do nonce recebido.

```
$ find . -name "*AuthLinkService*"
./sources/com/hasz/gymrats/app/di/CoreModule_ProvidesAuthLinkServiceFactory.java
./sources/com/hasz/gymrats/app/service/AuthLinkService$signIn$result$1.java
./sources/com/hasz/gymrats/app/service/AuthLinkService_Factory.java
./sources/com/hasz/gymrats/app/service/AuthLinkService$updateEmail$2$1.java
./sources/com/hasz/gymrats/app/service/AuthLinkService.java
./sources/com/hasz/gymrats/app/service/AuthLinkService$signIn$2$1.java
./sources/com/hasz/gymrats/app/service/AuthLinkService$updateEmail$result$1.java
```

A definição do setNone é uma chamada básica ao `SharedPreferences` que é algo semelhante ao `localStorage` no celular.


```
# em ./sources/com/hasz/gymrats/app/service/AuthLinkService.java

public final void setNonce(String str) {
    SharedPreferences.Editor editorEdit = this.sharedPreferences.edit();
    editorEdit.putString("gr-nonce-sense", str);
    editorEdit.apply();
}
```

Explorando mais esses dois arquivos, encontrei métodos como `login` no GymRatsBridge e `signIn` em AuthLinkService.

Infelizmente o `signIn` não descompilou corretamente, e o código ficou inacessível.

```
# em ./sources/com/hasz/gymrats/app/service/AuthLinkService.java

/* JADX INFO: Access modifiers changed from: private */
/* JADX WARN: Code restructure failed: missing block: B:41:0x0105, code lost:

    if (com.hasz.gymrats.app.navigation.Navigator.showSnackbar$default(r2, r0, null, false, null, r8, 14, null) == r11) goto L42;
 */
/* JADX WARN: Removed duplicated region for block: B:37:0x00e5  */
/* JADX WARN: Removed duplicated region for block: B:7:0x0018  */
/*
    Code decompiled incorrectly, please refer to instructions dump.
    To view partially-correct add '--show-bad-code' argument
*/
public final java.lang.Object signIn(java.lang.String r19, java.lang.String r20, java.lang.String r21, kotlin.coroutines.Continuation<? super kotlin.Unit> r22) {
    /*
        Method dump skipped, instruction units count: 267
        To view this dump add '--comments-level debug' option
    */
    throw new UnsupportedOperationException("Method not decompiled: com.hasz.gymrats.app.service.AuthLinkService.signIn(java.lang.String, java.lang.String, java.lang.String, kotlin.coroutines.Continuation):java.lang.Object");
    }
```

Já o login tem uma sequência de chamadas que podemos analisar.

```
# em ./sources/com/hasz/gymrats/app/domain/react_native/GymRatsBridge.java

@ReactMethod
public final void login(String accountJSON, String onboardingVariant, Promise promise) {
    Intrinsics.checkNotNullParameter(accountJSON, "accountJSON");
    Intrinsics.checkNotNullParameter(promise, "promise");
    this.authRepo.getOnboardingVariant().setValue(onboardingVariant);
    updateCurrentAccount(accountJSON, promise);
}



@ReactMethod
public final void updateCurrentAccount(String accountJSON, Promise promise) {
    Intrinsics.checkNotNullParameter(accountJSON, "accountJSON");
    Intrinsics.checkNotNullParameter(promise, "promise");
    try {
        BuildersKt__Builders_commonKt.launch$default(CoroutineScopeKt.CoroutineScope(Dispatchers.getMain()), null, null, new C09791((Account) this.gson.fromJson(accountJSON, Account.class), promise, null), 3, null);
    } catch (Throwable th) {
        promise.reject(th);
    }
}
```

Esse método `updateCurrentAccount` parece estranho pois está preocupado com dados da conta do usuário. A classe `Account` tem a seguinte definição:

```
# em ./sources/com/hasz/gymrats/app/api/model/Account.java./sources/com/hasz/gymrats/app/api/model/Account.java

public final /* data */ class Account implements Identifiable, Nameable, Picturable, Avatarable, Cachable {
    private final boolean chat_message_notifications_enabled;
    private final boolean comment_notifications_enabled;
    private final Instant created_at;
    private final String email;
    private final Boolean email_verified;
    private final String full_name;
    private final int id;
    private final String instagram;
    private final boolean periodic_winners_notifications_enabled;
    private final Boolean pro;
    private final String profile_picture_url;
    private final Challenge.MemberRole role;
    private final String tik_tok;
    private final String timezone;
    private final String token;
    private final String twitter;
    private final String uuid;
    private final boolean workout_notifications_enabled;
    private final boolean workout_reaction_notifications_enabled;
    ...
```

Aqui eu optei por fazer uma nova busca e ver se existe alguma classe mais específica pra lidar com a camada de API. Fui filtrando as bibliotecas utilizadas e com esse padrão eu consegui encontrar um arquivo que implementa algumas chamadas:


```
$ find . -name "*Api*" | grep -v androidx | grep -v kotlin | grep -v firebase | grep -v android

./sources/com/google/errorprone/annotations/RestrictedApi.java
./sources/com/google/crypto/tink/shaded/protobuf/ApiProto.java
./sources/com/google/crypto/tink/shaded/protobuf/Api.java
./sources/com/google/crypto/tink/shaded/protobuf/ExperimentalApi.java
./sources/com/google/crypto/tink/shaded/protobuf/ApiOrBuilder.java
./sources/com/google/accompanist/permissions/ExperimentalPermissionsApi.java
./sources/com/facebook/soloader/Api18TraceUtils.java
./sources/com/hasz/gymrats/app/api/GymRatsApi$demoteMemberFromMod$1.java
./sources/com/hasz/gymrats/app/api/GymRatsApi$uploadMuxVideo$1.java
./sources/com/hasz/gymrats/app/api/GymRatsApi$getBlockedAccounts$1.java
./sources/com/hasz/gymrats/app/api/GymRatsApi$shareWorkouts$1.java
./sources/com/hasz/gymrats/app/api/GymRatsApi$removeReaction$1.java
./sources/com/hasz/gymrats/app/api/GymRatsApi$smallWorld$1.java
./sources/com/hasz/gymrats/app/api/GymRatsApi$getSamsungHealthSettings$1.java
./sources/com/hasz/gymrats/app/api/GymRatsApi$updateFitbitAutoSync$1.java
./sources/com/hasz/gymrats/app/api/GymRatsApi$sponsoredChallenges$1.java
./sources/com/hasz/gymrats/app/api/GymRatsApi$getMembership$1.java
./sources/com/hasz/gymrats/app/api/GymRatsApi$removeTeam$1.java
./sources/com/hasz/gymrats/app/api/GymRatsApi$unblockAccount$1.java
./sources/com/hasz/gymrats/app/api/GymRatsApi$uploadWorkoutVideo$1.java
./sources/com/hasz/gymrats/app/api/GymRatsApi$updateEmail$1.java
```

GymRatsApi.java apareceu ali no meio, e abrindo ele, temos poucos métodos que descompilaram corretamente. Entre eles, um responsavel por ajustar um `Map` com os cabeçalhos comuns a todas as requisições:

```
# em ./sources/com/hasz/gymrats/app/api/GymRatsApi.java

private final String getDeviceId() {
    return this.idService.getDeviceId();
}

# ...

public final void updateBaseHeaders(String token) {
    Map<String, String> mapMapOf = MapsKt.mapOf(TuplesKt.to("rat-app-version", BuildConfig.VERSION_NAME), TuplesKt.to("rat-app-platform", "Android"), TuplesKt.to("rat-timezone", TimeZone.getDefault().getID()), TuplesKt.to("x-signature", getDeviceId()));
    if (token != null) {
        FuelManager.INSTANCE.getInstance().setBaseHeaders(MapsKt.plus(mapMapOf, MapsKt.mapOf(TuplesKt.to("Authorization", token))));
    } else {
        FuelManager.INSTANCE.getInstance().setBaseHeaders(mapMapOf);
    }
}
```

Dois pontos importantes aqui são:

- a definição dos headers `rat-*` e `x-signature` que podem estar sendo utilizados pra avaliar a autenticidade da requisição e;
- O uso do token vai no cabeçalho `Authorization` (possivelmente como Bearer).

Como ainda estamos lutando pra conseguir o token, vamos para a implementação do `getDeviceId()`.

```
# em ./sources/com/hasz/gymrats/app/service/IdService.java

public final String getDeviceId() {
    String string = this.sharedPreferences.getString(DEVICE_ID_KEY, null);
    if (string != null) {
        return string;
    }
    String string2 = UUID.randomUUID().toString();
    Intrinsics.checkNotNullExpressionValue(string2, "toString(...)");
    SharedPreferences.Editor editorEdit = this.sharedPreferences.edit();
    editorEdit.putString(DEVICE_ID_KEY, string2);
    editorEdit.apply();
    return string2;
}
```

É só um UUID :). Mas repare que ele é salvo nas sharedPreferences, ou seja, é o mesmo UUID enviado em todas as requisições de um mesmo aparelho.


Agora, precisamos do formato do `rat-app-version`, que está definido em BuildConfig:

```
$ find . -name "*BuildConfig*" | grep rat
./sources/com/hasz/gymrats/app/BuildConfig.java


# em ./sources/com/hasz/gymrats/app/BuildConfig.java

package com.hasz.gymrats.app;

/* JADX INFO: loaded from: classes7.dex */
public final class BuildConfig {
    public static final String API = "https://www.gymrats.app/api";
    public static final String APPLICATION_ID = "com.hasz.gymrats.app";
    public static final String BRANCH_MODE = "live";
    public static final String BUILD_TYPE = "releaseProduction";
    public static final boolean DEBUG = false;
    public static final String GYM_RATS_ENV = "production";
    public static final String INVITE_URL = "https://share.gymrats.app/join?code=";
    public static final boolean IS_HERMES_ENABLED = true;
    public static final boolean IS_NEW_ARCHITECTURE_ENABLED = true;
    public static final String PRIVACY_URL = "https://www.gymrats.app/privacy";
    public static final String TERMS_URL = "https://www.gymrats.app/terms";
    public static final int VERSION_CODE = 20251227;
    public static final String VERSION_NAME = "2025.12.27";
    public static final String WS = "wss://www.gymrats.app/chat/websocket";
}
```

A version name é a data no formato YYYY.MM.DD da release.

Mas você viu o mais importante? A URL da API é outra! O teste anterior foi feito na base de testes.

```
BASE_URL="https://www.gymrats.app"
curl -i -X POST "$BASE_URL/api/tokens" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"email\": \"$LOGIN_EMAIL\",
    \"password\": \"$LOGIN_PWD\"
  }"


HTTP/2 200
date: Wed, 25 Feb 2026 19:04:42 GMT
content-type: application/json; charset=utf-8
content-length: 797
cache-control: max-age=0, private, must-revalidate
strict-transport-security: max-age=31536000
x-request-id: b78c1e3cccf8bc9ea509b50cef7498e9
cf-cache-status: DYNAMIC
nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://..."}]}
server: cloudflare
cf-ray: 9d3870a60985f2d0-GRU

{"data":{"id":11111112,"twitter":null,"timezone":"America/Sao_Paulo","instagram":null,"token":"...","uuid":"...","email":"...","created_at":"2026-02-20T05:13:22.374277Z","full_name":"Teste","chat_message_notifications_enabled":true,"comment_notifications_enabled":true,"email_verified":true,"periodic_winners_notifications_enabled": "..."}}
```

<aside class="warning">A pergunta que não quer calar é: se eu estava usando a URL de pre-produção, por que o disparo de e-mail estava funcionando? Por causa disso eu fiquei muito, muito tempo travado nessa parte. Eu tinha certeza de que aquela era a URL certa.</aside>

NICE! Repare que não foi preciso enviar nenhum dos cabeçalhos, nem o `nonce`! Outra coisa, a resposta é aquele objeto `Account` que encontramos.

De grande importância é o nosso `token`, que vai ser usado pra acessar os dados da conta.

## Acessando os dados após login

Com o token registrado, podemos testar as URLs através de requisições GET simples.

Alguns pontos a serem levados em conta:

- O UUID enviado como `x-signature` deve ser o mesmo entre todas as requisições
- O campo `Authorization` não usa o prefixo `Bearer`, apenas o valor do token
- Envio dos cabeçalhos `rat-`
- Definição de content type pra envio e resposta (`application/json`)

Pra fechar o objetivo desse estudo, vamos puxar o export da conta do usuário. Como a API é bem organizada, dá pra chutar que tem "export" na URL do endpoint:

```
$ grep export output.js

.... # muito texto

        r1['exports'] = r2;
        r1['exports'] = r2;
        r0['exports'] = r1;
        r0['exports'] = r1;
        r0['exports'] = r1;
        r1['exports'] = r2;
        r1['exports'] = r2;
                                r3 = {'endpoint': '/account/export', 'format': null, 'fileName': 'account-data'};
                r4 = 'export_account_data';
                        r10 = 'export';
        r1['exports'] = r2;

.... # mais texto ainda
```

Que tal /account/export? E pra melhorar, os parâmetros junto :).

```
$ curl -i -X GET "$BASE_URL/api/account/export?format=json" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Authorization: $TOKEN" \
    -H "x-signature: $X_SIGNATURE" \
    -H "rat-app-version: 2026.02.13" \
    -H "rat-app-platform: Android" \
    -H "rat-timezone: America/Sao_Paulo"

HTTP/2 200
date: Wed, 25 Feb 2026 20:24:37 GMT
content-type: application/json; charset=utf-8
content-length: 452
cache-control: max-age=0, private, must-revalidate
strict-transport-security: max-age=31536000
x-request-id: 35855d3158150e7a872d0a107ba390c7
cf-cache-status: DYNAMIC
nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://..."}]}
server: cloudflare
cf-ray: 9d393d98ec0d52d2-GRU

{"data":{"messages":[],"profile":{"id":11113,"twitter":null,"timezone":"America/Sao_Paulo","instagram":null,"uuid":"....","updated_at":"2026-02-20T05:15:23.708860Z","email":"....","created_at":"2026-02-20T05:13:22.374277Z","full_name":"Teste","profile_picture_url":null,"pro":false,"tik_tok":null},"comments":[],"reactions":[],"challenges":[],"check_ins":[],"device_activities":[]},"status":"success"}
```

## Script com o fluxo completo

O fluxo de login + exportar dados fica assim:

```
#!/bin/bash

set -u
set -e

BASE_URL="https://www.gymrats.app/api"
X_SIGNATURE=$(uuidgen)
LOGIN_EMAIL="seuemail@provedor.com"
LOGIN_PWD="suasenhaqui!!"

TOKEN_RES=$(curl -s -X POST "$BASE_URL/tokens" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "x-signature: $X_SIGNATURE" \
  -d "{
    \"email\": \"$LOGIN_EMAIL\",
    \"password\": \"$LOGIN_PWD\"
  }")

TOKEN=$(echo $TOKEN_RES | jq -r .data.token)

curl -i -X GET "$BASE_URL/account/export?format=json" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"  \
  -H "Authorization: $TOKEN" \
  -H "x-signature: $X_SIGNATURE" \
  -H "rat-app-version: 2026.02.13" \
  -H "rat-app-platform: Android" \
  -H "rat-timezone: America/Sao_Paulo"
```

## Considerações finais

O processo de engenharia reversa é demorado, e você vai bater com a cabeça na parede várias vezes. Tudo bem! Tenha em mente que toda aplicação precisa de uma lógica interna. Se não, os desenvolvedores não conseguiriam navegar nela.

Por causa do envio de e-mail ter funcionado na URL de pre-production, eu fiquei muito, muito tempo tentando descobrir combinações de NONCE e hash de senha pra fazer login. No final, o primeiro formato de requisição que eu testei acabou funcionando.

Eu só avancei quando comecei a explorar o código fonte através do jadx, abrindo ele pra análise com calma num editor de texto.

Lembre-se de não abusar dos endpoints da API, afinal você está autenticado com o seu usuário.

Bons desenvolvimentos!

### Algumas técnicas que eu tentei utilizar que não foram pra frente

Essa parte não é tão interessante, mas vou deixar registrado aqui pra caso eu acabe passando por isso de novo no futuro.

#### Rodar o APK em um dispositivo virtual: minha máquina é x86, e o APK que eu consegui tem como build target processadores ARM64

Comecei instalando o android-studio através do snap (`sudo snap install android-studio --classic`) e depois rodando o android-studio pela primeira vez pra fazer a instalação (botei tudo no default).

Configurei o [VM acceleration](https://developer.android.com/studio/run/emulator-acceleration?utm_source=android-studio#vm-linux-check-kvm).

Em **More actions -> SDK Manager** verifiquei a instalação do Android SDK v16.0 ("Baklava"), Android SDK Platform-Tools, Android Emulator e Android SDK Build-Tools.

Por fim instalei um Pixel 5 e selecionei "Google APIs" em "Services".

Detalhe sobre a imagem: a arquitetura precisa bater com a arquitetura disponível no seu apk. No meu caso após a extração o arquivo `config.arm64_v8a.apk` indica que a arquitetura esperada é arm64.

Se tentar rodar com uma imagem x86_64, o app abre e crasha pois não consegue carregar algumas bibliotecas:

```
$ adb logcat

...
02-19 13:00:00.126 10185 10185 E AndroidRuntime: Native lib dir: /data/app/~~yp_-PjvPA6HHEEDz_3sECw==/com.hasz.gymrats.app-KVF08zb_qoqMfB8_C-p2Dw==/lib/arm64
``` 

Tentei ajustar a arquitetura do emulador indo [na aba "Additional settings"](https://ibb.co/yCSVPLP) na criação do dispositivo, mas a configuração não resultou em uma imagem arm64, o que pude verificar com

```
$ adb shell getprop ro.product.cpu.abi
x86_64
```

Então restou baixar uma imagem ARM, com

```
$ sdkmanager system-images;android-36.0-Baklava;google_apis;arm64-v8a
```

Após a instalação, ela fica [disponível no seletor](https://ibb.co/jvYjbRTs), mas não consegui iniciar o emulador (na minha inocência eu tinha achado que o android-studio ia fazer essa adaptação entre arquiteturas):

> Error when startnig the Pixel 5 with arm image:
> Avd's CPU Architecture 'arm64' is not supported by the QEMU2 emulator on x86_64 host.
> System image must match the host architecture

Parecem existir formas de fazer essa tradução entre ARM e x86, mas no fim das contas eu consegui um smartphone com android pra testes.

#### Usando um smartphone

Após conectar o celular no notebook em modo debug, dá pra validar que ele foi reconhecido e também a arquitetura com:

```
$ adb devices && adb shell getprop ro.product.cpu.abi
List of devices attached
0071264499	device

arm64-v8a
```

Eu não consegui avançar muito nessa frente pois, como eu não tinha como modificar o código do apk (ou até conseguiria, usando ferramentas como [Frida](https://frida.re/docs/android/), mas pelo que entendi exigiria rootar o smartphone, coisa que eu não quis fazer).

Minha única opção seria, então, tentar interceptar o tráfego do aplicativo usando algo como Wireshark. Como o app usa certificate pinning (não aceita certificados SSL auto assinados), e usa TLS, [ainda existia a chance das URLs serem criptografadas](https://stackoverflow.com/a/38727920).

Acabei voltando pra análise estática do código, mas caso eu tivesse conseguido identificar as URLs teria visto que eu estava testando as requisições contra a URL errada.

Fica pra próxima vez testar essa abordagem.

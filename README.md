# guilhermegarcia.dev

This is the code behind my static website at <https://guilhermegarcia.dev>.

It's a standard [hugo](https://gohugo.io/) blog using the [bearblog theme](https://github.com/janraasch/hugo-bearblog).

The project uses hugo v0.121.0. To download this specific version:

```bash
HUGO_VERSION=0.121.0
wget -O /tmp/hugo.deb https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.deb \
          && sudo dpkg -i /tmp/hugo.deb && sudo apt-mark hold hugo
```

The last command prevents hugo from being updated together with other system packages
through `apt update` or similar.

## Development

Clone the thing and create new files with either (for single .md pages):

```bash
hugo new blog/my-new-post.md
```

 or, if you need a separate directory for your page, just copy an existing post
 and change the metadata (yep).

## Deployment

The project uses hugo 0.121.0.

To deploy, build the public directory with `hugo` and push (content/, public/,
static/, etc) to the hugo branch.

There is a GH Action that will then deploy the thing.

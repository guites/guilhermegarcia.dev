# guilhermegarcia.dev

This is the code behind my static website at <https://guilhermegarcia.dev>.

It's a standard [hugo](https://gohugo.io/) blog using the [bearblog theme](https://github.com/janraasch/hugo-bearblog).

## Development

Clone the thing and create new files with either (for single .md pages):

    hugo new blog/my-new-post.md
 
 or, if you need a separate directory for your page, just copy an existing post and change the metadata (yep).

## Deployment

Just push things to the `hugo` branch. There's a [workflow](https://github.com/guites/guilhermegarcia.dev/blob/hugo/.github/workflows/hugo.yaml) which runs the build and deployment steps.

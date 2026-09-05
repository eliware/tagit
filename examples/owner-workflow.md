# Owner workflow example

Run these commands from the root of the repository being prepared:

```text
tagit notes
tagit preflight
tagit push
```

Project owners stop after the handoff. DevOps runs the authorized release and
post-release verification only after preflight passes. The example performs
no version change, tag creation, publication, or deployment.

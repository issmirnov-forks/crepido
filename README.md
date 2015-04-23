# Crepido
Create boards to track users and projects from flat markdown files.

## Setup

1. `$ git clone git@github.com:arshad/crepido.git`.
2. `$ cd crepido && npm install`.
3. `$ gulp`.

## How to create boards

1. Create a file in the *./boards* directory.
2. Add your text as follows.

```
---
name: Arshad
picture: https://avatars0.githubusercontent.com/u/124599?v=3&s=460
---

# In Progress

* [Project A] Gumbo beet greens corn soko endive gumbo gourd.

# Pipeline

* [Project A] Turnip greens yarrow ricebean rutabaga endive.
* [Project B] Nori grape silver beet broccoli kombu beet greens fava bean.
```

3. Run `$ gulp`

Note:

1. Each heading followed by a list will be converted to a card.
2. [Title] [labels] are converted to labels.

## How to deploy to Github Pages

1. Update `remoteUrl, origin and branch` in *config.json*.
2. Run `$ gulp deploy`.

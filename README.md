# Content Extraction

## Requirements

The script requires `yarn` and `pipenv`

## Retriever

```bash
cd ./retriever

# Install dependencies
yarn install

# It is assumed that data.json is at the project root
node index.js '../data.json' '/tmp/extraction'
```

The file `data.json` is list of `id`, `webId` and `url` field.

## Extractor

```bash
cd ./extractor
# Install dependencies
pipenv install
# If you are not inside pipenv shell, run `pipenv shell`
python main.py '../data.json' '/tmp/extraction' '/tmp/output.json'
```

The final output will be saved in `/tmp/output.json`.

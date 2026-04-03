# Progress Bar Page (Nuxt 4 + MongoDB)

A small Nuxt 4 app that stores and displays long-running progress in MongoDB.

## What’s included
- REST endpoints:
  - `GET  /api/progress/:id` - fetch progress by UUID
  - `POST /api/progress/:id` - upsert progress (body: `completed`, `total`, `startTime`; header `x-api-key`; response: `{ id }`)
- Frontend pages:
  - `/?id=<uuid>` - shows an animated progress bar, percentages, average time per item, ETA, and due time
  - `/example` - **demo UI only** (no MongoDB): mock progress with the same dashboard as the main page

## MongoDB document shape
The `progress` collection stores:
`{ id: string, completed: int, total: int, startTime: Date }`

## Environment variables
Copy `.env.example` to `.env`:
- `MONGODB_URI` (required)
- `MONGODB_DB` (optional, default: `progressdb`)
- `MONGODB_COLLECTION` (optional, default: `progress`)

## Run it
```bash
yarn install
yarn dev
```

Open:
- `http://localhost:3000/?id=<uuid>`
- `http://localhost:3000/example` (demo)

## Build
```bash
yarn build
```

## License

This work is licensed under a [Creative Commons Attribution-NonCommercial 4.0 International License](https://creativecommons.org/licenses/by-nc/4.0/).

## Contact

For questions or feedback, please reach out via GitHub.
[ifmcjthenknczny](https://github.com/ifmcjthenknczny)  

Project Link: [https://github.com/ifmcjthenknczny/progress-bar-page](https://github.com/ifmcjthenknczny/progress-bar-page)
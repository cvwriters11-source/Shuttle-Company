# Lion's Route Shuttles SA Website

A responsive Next.js website for Lion's Route Shuttles SA, including the homepage,
service and destination pages, and a quote request form.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quote requests

The quote form validates all required journey details in the browser, then opens
the visitor's default email application with a formatted message addressed to
`Mazenoch@gmail.com`. No customer data is stored and no API credentials are
required. The visitor must review and send the prepared email from their email
application.

## Production checks

```bash
npm run lint
npm run build
```

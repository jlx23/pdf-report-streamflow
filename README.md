This is a [Next.js](https://nextjs.org/) project featuring a tool to download detailed stream reports from [Streamflow Finance](https://streamflow.finance/)

## Getting Started

First, install all the necesary dependencies

```bash
npm install
# or
yarn
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You will see a one page website featuring a single React component that generates a detailed stream report and prompts you to download it in a PDF file when used. This component can be found at `components/downloadReport.tsx`.

## Usage

Since this application is a prototype, built with the purpose of ultimately integrate the React component `downloadReport.tsx` in the Streamflow Finance front-end, some parameters intended to be read from the enviroment variables are hardcoded for the ease of use of this first iteration. This parameters are the stream ID, the RPC endpoint and the number of decimals of the streamed token.

Simply introduce the stream ID you wish to generate the report for and click on the blue button "Download Report". The default values for the RPC endpoint and token decimals are:

```bash
rpcEndpoint = "https://api.devnet.solana.com"
tokenDecimals = 9
```
This parameters can be found and edited at `downloadReport.tsx:17` and `downloadReport.tsx:18`, respectively.


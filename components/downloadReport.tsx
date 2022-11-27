import React, { FC, useCallback } from "react";
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import {
  StreamClient,
  Stream,
} from "@streamflow/stream";
import styles from '../styles/Home.module.css';


export const DownloadReport: FC = () => {

  const onClick = useCallback(async (e: any) => {
    e.preventDefault();

    const streamID = e.target.streamID.value;
    const rpcEndpoint = "https://api.devnet.solana.com"//# CHANGE RPC ENDPOINT HERE
    const tokenDecimals = 9; //########################### CHANGE TOKEN DECIMALS HERE
    const streamClient = new StreamClient(rpcEndpoint);

    async function getStreamData() {
      var streamData = {} as Stream
      try {
        streamData = await streamClient.getOne(streamID);
      } catch (e: any) {
        alert("Something went wrong, please check your input and try again")
      }
      return streamData
    }

    const data = await getStreamData()

    if (data.name) {

      const name = data.name.split("\u0000").join("");
      var status = '';
      const sender = data.sender;
      const recipient = data.recipient;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const depositedAmount = data.depositedAmount / (10 ** tokenDecimals);
      const unlockedAmount = data.unlocked(currentTimestamp, 0) / 10 ** tokenDecimals;
      const startTime = new Date(data.start * 1000).toLocaleString();
      const endTime = new Date(data.end * 1000).toLocaleString()
      const streamflowFeeTotal = data.streamflowFeeTotal / 10 ** tokenDecimals;
      const streamflowFeePercent = streamflowFeeTotal / depositedAmount * 100;
      const releaseRateSeconds = depositedAmount / (data.end - data.start);
      const releaseRateHours = releaseRateSeconds * 60 * 60;
      const releaseRateDays = releaseRateHours * 24;
      var transferableBy = '';
      var cancelableBy = '';

      if (currentTimestamp - data.start <= 0) {
        status = 'Scheduled'
      }
      else if (currentTimestamp - data.start > 0 && currentTimestamp - data.end < 0) {
        status = 'Ongoing'
      }
      else if (currentTimestamp - data.end > 0) {
        status = 'Completed'
      }
      else if (data.canceledAt > 0) {
        status = 'Cancelled'
      }

      if (data.transferableBySender && data.transferableByRecipient) {
        transferableBy = 'Both Sender and Recipient'
      }
      else if (data.transferableBySender) {
        transferableBy = 'Only Sender'
      }
      else if (data.transferableByRecipient) {
        transferableBy = 'Only Recipient'
      }
      else {
        transferableBy = 'Not Transferable'
      }

      if (data.cancelableBySender && data.cancelableByRecipient) {
        cancelableBy = 'Both Sender and Recipient'
      }
      else if (data.cancelableBySender) {
        cancelableBy = 'Only Sender'
      }
      else if (data.cancelableByRecipient) {
        cancelableBy = 'Only Recipient'
      }
      else {
        cancelableBy = 'Not Transferable'
      }

      const doc = new jsPDF();
      const documentName = 'Streamflow-Report-' + streamID;

      autoTable(doc, {
        body: [
          [
            {
              content: 'Streamflow Finance Stream Report',
              styles: {
                halign: 'center',
                fontSize: 20,
                fontStyle: 'bolditalic'
              }
            },
          ],
        ],
        theme: 'plain',

      });

      autoTable(doc, {
        head: [
          {
            summary: 'Summary',
            noting: '',
          }
        ],
        body: [
          ['Subject', name],
          ['Status', status],
          ['Sender', sender],
          ['Recipient', recipient],
          ['Total locked amount', depositedAmount + ' [Token Units WIP]'],
          ['Unlocked amount', unlockedAmount + ' [Token Units WIP]'],
          ['Start time', startTime],
          ['End time', endTime],
        ],
        theme: 'striped',
        styles: {
          fillColor: '#ccddff',
        },
        headStyles: {
          fillColor: '#1a66ff',
          fontSize: 18

        },
        didParseCell: (d) => {
          if (d.section == 'body') {
            if (d.column.index === 0) {
              d.cell.styles.halign = 'left'
            }
            else {
              d.cell.styles.halign = 'right'
            }
          }
        },
      })

      autoTable(doc, {
        head: [
          ['Additional Information', ''],
        ],
        body: [
          ['Stream ID', streamID],
          ['Release rate',
            releaseRateSeconds.toFixed(6) + ' tokens/second' + '\n' +
            releaseRateHours.toFixed(6) + ' tokens/hour' + '\n' +
            releaseRateDays.toFixed(6) + ' tokens/day'
          ],
          ['Transferable by', transferableBy],
          ['Cancelable by', cancelableBy],
          ['Streamflow fee percent', streamflowFeePercent + '%'],
          ['Streamflow fee', streamflowFeeTotal + ' [Token Units WIP]'],
        ],
        theme: 'striped',
        headStyles: {
          fillColor: '#343a40',
          fontSize: 18
        },
        didParseCell: (d) => {
          if (d.section == 'body') {
            if (d.column.index === 0) {
              d.cell.styles.halign = 'left'
            }
            else {
              d.cell.styles.halign = 'right'
            }
          }
        },
      })

      autoTable(doc, {
        head: [['Withdrawal History', '']],
        body: [['WIP', 'WIP']],
        theme: 'striped',
        headStyles: {
          fillColor: '#343a40',
          fontSize: 18
        },
        didParseCell: (d) => {
          if (d.section == 'body') {
            if (d.column.index === 0) {
              d.cell.styles.halign = 'center'
            }
            else {
              d.cell.styles.halign = 'center'
            }
          }
        },
      })

      doc.save(documentName)
    }
  }, [jsPDF, autoTable, StreamClient]);

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.title}>Please input the stream ID you wish to generate the report for</div>
        <form className={styles.card} onSubmit={onClick}>

          <input
            className={styles.input}
            id="streamID"
            name="streamID"
            type="text"
            required
          />
          <button
            type="submit"
            className={styles.button}
          >
            Download Report
          </button>
        </form>
      </div>
    </div>
  )
};
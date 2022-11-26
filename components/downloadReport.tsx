import React, { FC, useCallback, useState } from "react";
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Connection, PublicKey } from "@solana/web3.js";
import {
    StreamClient,
    Stream,
    CreateParams,
    CreateMultiParams,
    WithdrawParams,
    TransferParams,
    TopupParams,
    CancelParams,
    GetAllParams,
    StreamDirection,
    StreamType,
    Cluster,
    TxResponse,
    CreateResponse,
    BN,
    getBN,
    getNumberFromBN,
} from "@streamflow/stream";


export const DownloadReport: FC = () => {

    const onClick = useCallback(async (e:any) => {
      e.preventDefault();

      const streamID = e.target.streamID.value;
      const streamClient = new StreamClient("https://api.devnet.solana.com");

      async function getStreamData() {
        var streamData = {} as Stream
        try {
          streamData = await streamClient.getOne(streamID);
        } catch (e:any) {
          throw e
        }
        return streamData
      }

      const data = await getStreamData()
      
      const name = data.name.split("\u0000").join("");
      var status = '';
      const sender = data.sender;
      const recipient = data.recipient;
      const currentTimestamp = Math.floor(Date.now()/1000);
      const depositedAmount = data.depositedAmount / (10**9);
      const unlockedAmount = data.unlocked(currentTimestamp, 0) / 10**9;
      const startTime = new Date(data.start * 1000).toLocaleString();
      const endTime = new Date(data.end * 1000).toLocaleString()
      const streamflowFeeTotal = data.streamflowFeeTotal / 10**9;
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
        transferableBy = 'Sender and Recipient'
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
        cancelableBy = 'Sender and Recipient'
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
      autoTable(doc, {
          body: [
            [
                {
                  content: 'StreamFlow Finance Stream Report',
                  styles: {
                    halign: 'center',
                    fontSize: 20,
                    //textColor: '#ffffff'
                    fontStyle: 'bolditalic'
                  }
                },
            ],
          ],
          theme: 'plain',
          
      });

      autoTable(doc, {
        head:[
            {
              summary: 'Summary',
              noting: '',
            }
        ],
        body:[
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
        head:[
            ['Additional Information', ''],
        ],
        body:[
            ['Stream ID', streamID],
            ['Release rate', 
              releaseRateSeconds.toFixed(6) + ' token/second' + '\n' +
              releaseRateHours.toFixed(6) + ' token/hour' + '\n' +
              releaseRateDays.toFixed(6) + ' token/day'
            ],
            ['Transferable by', transferableBy],
            ['Cancelable by', cancelableBy],
            ['Streamflow fee percent', streamflowFeePercent + '%'],
            ['Streamflow fee', streamflowFeeTotal+ ' [Token Units WIP]'],
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

        doc.save("test")

    }, [jsPDF, autoTable, StreamClient]);

    return (
      <div className="max-w-xs my-2 overflow-hidden rounded shadow-lg">
      <div className="px-6 py-4">
        <div className="mb-2 text-xl font-bold">Please input the stream ID you wish to generate the report for</div>
        <form className="flex flex-col" onSubmit={onClick}>
          
          <input
            className="mb-4 border-b-2"
            id="streamID"
            name="streamID"
            type="text"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
    )
};
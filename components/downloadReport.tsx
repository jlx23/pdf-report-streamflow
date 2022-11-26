import React, { FC, useCallback } from "react";
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Connection, PublicKey } from "@solana/web3.js";
import * as borsh from "@project-serum/borsh"
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
import { TokenListProvider } from "@solana/spl-token-registry";

export const DownloadReport: FC = () => {

    const onClick2 = useCallback(async () => {
        const connection = new Connection("https://api.devnet.solana.com");
        const address = new PublicKey("6xAYhRfVbYo9yQcGLUtETJ3K1YHYR76fod5a8KNFnR6g");
        const pda = new PublicKey("Gssm3vfi8s65R31SBdmQRq6cKeYojGgup7whkw4VCiQj")

        const info = await connection.getParsedAccountInfo(pda);
        //console.log(info.value?.data.)

        new TokenListProvider().resolve().then((tokens) => {
          const tokenList = tokens.getList();
          console.log(tokenList)
        })

        

    },[Connection, PublicKey])

    const onClick = useCallback(async () => {

      const streamID = "KQ3zTd817m3TzkpoXuriHZ3ad2hoDu1rvC7Wcc6eUZ8";
      const streamClient = new StreamClient("https://api.devnet.solana.com");
      const data = await streamClient.getOne(streamID);
      console.log(data)
      const currentTimestamp = Math.floor(Date.now()/1000);
      //var status = 'scheduled' || 'ongoing' || 'completed' || 'cancelled';
      var status = '';
      
      if (currentTimestamp - data.start <= 0) {
        status = 'Scheduled'
      }
      else if (currentTimestamp - data.start > 0 && currentTimestamp - data.cliff < 0) {
        status = 'Ongoing'
      }
      else if (currentTimestamp - data.cliff > 0) {
        status = 'Completed'
      }
      else if (data.canceledAt > 0) {
        status = 'Cancelled'
      }

      const name = data.name.split("\u0000").join("")
      const sender = data.sender
      const recipient = data.recipient
      const depositedAmount = data.depositedAmount / (10**9);
      const unlockedAmount = data.unlocked(currentTimestamp, 0) / 10**9;
      const startTime = new Date(data.start * 1000).toLocaleString();
      const endTime = new Date(data.end * 1000).toLocaleString()
      const streamflowFeeTotal = data.streamflowFeeTotal / 10**9;
      const streamflowFeePercent = streamflowFeeTotal / depositedAmount * 100;
      const releaseRateSeconds = unlockedAmount / (data.end - data.start)
      const releaseRateHours = releaseRateSeconds * (60*60)
      const releaseRateDays = releaseRateHours * 24

      var transferableBy = '';
      var cancelableBy = ''

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
              releaseRateSeconds + ' token/second' + '\n' +
              releaseRateHours + ' token/hour' + '\n' +
              releaseRateDays + ' token/day'
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
              d.cell.styles.halign = 'left'
            }
            else {
              d.cell.styles.halign = 'right'
            }
          }
        },
      })

        doc.save("test")

    }, [jsPDF, autoTable, StreamClient]);

    return (
        <div>
            <button
                onClick={onClick}
            >
                Download Report
            </button>
        </div>
    )
};
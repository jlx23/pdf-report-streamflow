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

export const DownloadReport: FC = () => {

    const onClick2 = useCallback(async () => {
        const connection = new Connection("https://api.devnet.solana.com");
        const address = new PublicKey("6xAYhRfVbYo9yQcGLUtETJ3K1YHYR76fod5a8KNFnR6g");
        const pda = new PublicKey("BdtWKumTT3KP6ykhZwE5A2QXquukfaLB1KuRHHbfRJkc")

        const info = await connection.getAccountInfo(pda);
        console.log(info?.data)

        

    },[Connection, PublicKey])

    const onClick = useCallback(async () => {

      const stream = new StreamClient("https://api.devnet.solana.com");
      const data = await stream.getOne("BdtWKumTT3KP6ykhZwE5A2QXquukfaLB1KuRHHbfRJkc");
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

      const depositedAmount = data.depositedAmount / (10**9);
      const unlockedAmount = data.unlocked(currentTimestamp, 0) / 10**9;
      const startTime = new Date(data.start * 1000).toLocaleString();
      const endTime = new Date(data.end * 1000).toLocaleString()

      const doc = new jsPDF();
      autoTable(doc, {
          body: [
            [
                {
                  content: 'StreamFlow Finance Report',
                  styles: {
                    halign: 'center',
                    fontSize: 20,
                    textColor: '#ffffff'
                  }
                },
            ],
          ],
          theme: 'plain',
          styles: {
              fillColor: '#1a66ff'
          },
      });

      autoTable(doc, {
        head:[
            ['Summary', ''],
        ],
        body:[
            ['Subject', data.name],
            ['Status', status],
            ['Sender', data.sender],
            ['Receiver', data.recipient],
            ['Total locked amount', depositedAmount],
            ['Unlocked amount', unlockedAmount],
            ['Start time', startTime],
            ['End time', endTime],
        ],
        theme: 'striped',
        styles: {
            fillColor: '#ccddff'
        },
        headStyles: {
            fillColor: '#1a66ff',
            fontSize: 18
            
        }
      })

      autoTable(doc, {
        head:[
            ['Additional Information', ''],
        ],
        body:[
            ['Subject', data.name],
            ['Status', status],
            ['Sender', data.sender],
            ['Receiver', data.recipient],
            ['Total locked amount', depositedAmount],
            ['Unlocked amount', unlockedAmount],
            ['Start time', startTime],
            ['End time', endTime],
        ],
        theme: 'striped',
        headStyles: {
            fillColor: '#343a40',
            fontSize: 18
            
        }
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
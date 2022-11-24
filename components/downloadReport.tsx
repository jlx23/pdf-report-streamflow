import React, { FC, useCallback } from "react";
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export const DownloadReport: FC = () => {

    const onClick = useCallback(async () => {
        const doc = new jsPDF();

        autoTable(doc, {
            body: [
              [
                {
                  content: 'Company brand',
                  styles: {
                    halign: 'left',
                    fontSize: 20,
                    textColor: '#ffffff'
                  }
                },
                {
                  content: 'Invoice',
                  styles: {
                    halign: 'right',
                    fontSize: 20,
                    textColor: '#ffffff'
                  }
                }
              ],
            ],
            theme: 'plain',
            styles: {
              fillColor: '#3366ff'
            }
          });

          doc.save("test")

    }, [jsPDF, autoTable]);

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
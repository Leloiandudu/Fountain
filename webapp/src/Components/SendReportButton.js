import { saveAs } from 'file-saver';
import React from 'react';
import { getTelemetry } from '../telemetry';

export default function SendReportButton() {
   return <button className='SendReportButton' onClick={onClick}>Technical Information.</button>
}

function onClick() {
   var blob = new Blob([ JSON.stringify(getTelemetry()) ], { type: 'application/octet-stream;charset=utf-8' });
   saveAs(blob, 'report');
}

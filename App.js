import {Alert, Linking, Platform} from 'react-native';
import {
  BluetoothEscposPrinter,
  BluetoothManager,
} from 'react-native-bluetooth-escpos-printer';

import RNExitApp from 'react-native-exit-app';
import React from 'react';

const App = () => {
  let headData = [],
    bodyData = [],
    billType;

  if (Platform.OS === 'android') {
    Linking.getInitialURL().then((url) => {
      if (url === null) {
        return;
      }

      const route = url.replace(/.*?:\/\//g, '');

      headData = JSON.parse(decodeURIComponent(route.split('/')[1]));
      bodyData = JSON.parse(decodeURIComponent(route.split('/')[2]));
      billType = route.split('/')[3];
    });
  } else {
    Alert.alert('Unknown', 'URL Issues');
  }

  // headData for bill: {"netTotal": netTotal, "billNo": billno, "waiterName": waiterName, "tableName": tableName, "custName": custName}
  // bodyData  for bill: {"desc": response[i].DESCRIPTION, "quant": response[i].QUANTITY, "price": response[i].PRICE, "total": response[i].TOTAL}
  // headData for kot: {"totalQty":totalQty, "kotNo": kotno, "waiterName": waiterName, "tableName": tableName, "custName": custName}
  // bodyData for kot: {"desc":response[i].DESCRIPTION, "quant":response[i].QUANTITY}

  BluetoothManager.connect('00:01:90:85:0F:06') // the device address scanned.
    .then(
      (s) => {
        return;
      },
      (e) => {
        console.log(e);
        Alert.alert('Connection Issue', e + ' Please check Bluetooth.');
      },
    )
    .finally(async () => {
      if (headData !== [] && bodyData !== []) {
        await BluetoothEscposPrinter.printerAlign(
          BluetoothEscposPrinter.ALIGN.CENTER,
        );
        await BluetoothEscposPrinter.setBlob(0);
        await BluetoothEscposPrinter.printText('Hotel Name\n\r', {
          encoding: 'GBK',
          codepage: 0,
          widthtimes: 1,
          heigthtimes: 0,
          fonttype: 1,
        });

        if (billType === 'bill') {
          await BluetoothEscposPrinter.printText('Invoice\n\r', {
            encoding: 'GBK',
            codepage: 0,
            widthtimes: 1,
            heigthtimes: 0,
            fonttype: 1,
          });
        } else if (billType === 'kot') {
          await BluetoothEscposPrinter.printText('KOT\n\r', {
            encoding: 'GBK',
            codepage: 0,
            widthtimes: 1,
            heigthtimes: 0,
            fonttype: 1,
          });
        }

        await BluetoothEscposPrinter.printText('\n\r', {});
        let columnWidths = [14, 2, 22];

        if (billType === 'bill') {
          await BluetoothEscposPrinter.printColumn(
            columnWidths,
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.CENTER,
              BluetoothEscposPrinter.ALIGN.LEFT,
            ],
            ['Bill No.', ':', headData[0].billNo],
            {fonttype: 1},
          );
        } else if (billType === 'kot') {
          await BluetoothEscposPrinter.printColumn(
            columnWidths,
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.CENTER,
              BluetoothEscposPrinter.ALIGN.LEFT,
            ],
            ['KOT No.', ':', headData[0].kotNo],
            {fonttype: 1},
          );
        }
        await BluetoothEscposPrinter.printText('\r', {});

        var date = new Date().getDate();
        var month = new Date().getMonth() + 1;
        var year = new Date().getFullYear();
        var hours = new Date().getHours();
        var min = new Date().getMinutes();
        var sec = new Date().getSeconds();
        const dateTime =
          date + '/' + month + '/' + year + ' ' + hours + ':' + min + ':' + sec;

        await BluetoothEscposPrinter.printColumn(
          columnWidths,
          [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.CENTER,
            BluetoothEscposPrinter.ALIGN.LEFT,
          ],
          ['Date ', ':', dateTime],
          {fonttype: 1},
        );
        await BluetoothEscposPrinter.printText('\r', {});
        await BluetoothEscposPrinter.printColumn(
          columnWidths,
          [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.CENTER,
            BluetoothEscposPrinter.ALIGN.LEFT,
          ],
          ['Waiter', ':', headData[0].waiterName],
          {fonttype: 1},
        );
        await BluetoothEscposPrinter.printText('\r', {});
        await BluetoothEscposPrinter.printColumn(
          columnWidths,
          [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.CENTER,
            BluetoothEscposPrinter.ALIGN.LEFT,
          ],
          ['Table No.', ':', headData[0].tableName],
          {fonttype: 1},
        );
        await BluetoothEscposPrinter.printText('\r', {});
        await BluetoothEscposPrinter.printColumn(
          columnWidths,
          [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.CENTER,
            BluetoothEscposPrinter.ALIGN.LEFT,
          ],
          ['Customer ', ':', headData[0].custName],
          {fonttype: 1},
        );
        await BluetoothEscposPrinter.printText('\n\r', {});
        await BluetoothEscposPrinter.printText(
          '--------------------------------\n\r',
          {},
        );
        let dataColumnWidths = [20, 4, 8, 8];

        if (billType === 'bill') {
          await BluetoothEscposPrinter.printColumn(
            dataColumnWidths,
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.CENTER,
              BluetoothEscposPrinter.ALIGN.RIGHT,
              BluetoothEscposPrinter.ALIGN.RIGHT,
            ],
            ['Item', 'Qty', 'Rate', 'Total'],
            {
              widthtimes: 0,
              fonttype: 1,
            },
          );
          await BluetoothEscposPrinter.printText('\n\r', {});
          bodyData.map(
            async (i) =>
              await BluetoothEscposPrinter.printColumn(
                dataColumnWidths,
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.CENTER,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                [i.desc, i.quant, i.price, i.total],
                {fonttype: 1},
              ),
          );
        } else if (billType === 'kot') {
          await BluetoothEscposPrinter.printColumn(
            [20, 6, 6, 8],
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.CENTER,
              BluetoothEscposPrinter.ALIGN.CENTER,
              BluetoothEscposPrinter.ALIGN.CENTER,
            ],
            ['Item', '', '', 'Qty'],
            {
              widthtimes: 0,
              fonttype: 1,
            },
          );
          await BluetoothEscposPrinter.printText('\n\r', {});
          bodyData.map(
            async (i) =>
              await BluetoothEscposPrinter.printColumn(
                [24, 4, 4, 8],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.CENTER,
                  BluetoothEscposPrinter.ALIGN.CENTER,
                  BluetoothEscposPrinter.ALIGN.CENTER,
                ],
                [i.desc, '', '', i.quant],
                {fonttype: 1},
              ),
          );
        }

        await BluetoothEscposPrinter.printText('\n\r', {});
        await BluetoothEscposPrinter.printText(
          '--------------------------------\n\r',
          {},
        );
        let footerColumnWidths = [14, 8, 8, 12];
        if (billType === 'bill') {
          await BluetoothEscposPrinter.printColumn(
            footerColumnWidths,
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.CENTER,
              BluetoothEscposPrinter.ALIGN.CENTER,
              BluetoothEscposPrinter.ALIGN.RIGHT,
            ],
            ['Net. Total  :', '', '', headData[0].netTotal],
            {
              widthtimes: 0,
              fonttype: 1,
            },
          );
          await BluetoothEscposPrinter.printText(
            '--------------------------------\n\r',
            {},
          );
          await BluetoothEscposPrinter.printerAlign(
            BluetoothEscposPrinter.ALIGN.CENTER,
          );
          await BluetoothEscposPrinter.printText(
            'Thank You. \n\rPlease Come Again!\n\r',
            {
              encoding: 'GBK',
              codepage: 0,
              widthtimes: 1,
              heigthtimes: 0,
              fonttype: 1,
            },
          );
        } else if (billType === 'kot') {
          await BluetoothEscposPrinter.printColumn(
            [20, 6, 6, 10],
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.CENTER,
              BluetoothEscposPrinter.ALIGN.CENTER,
              BluetoothEscposPrinter.ALIGN.CENTER,
            ],
            ['Total Quantity  :', '', '', headData[0].totalQty],
            {
              widthtimes: 0,
              fonttype: 1,
            },
          );
        }
        await BluetoothEscposPrinter.printText('\n\r\n\n\r', {}).then(
          () => {
            RNExitApp.exitApp();
          },
          (err) => {
            Alert.alert(err);
          },
        );
      } else {
        await BluetoothEscposPrinter.printerAlign(
          BluetoothEscposPrinter.ALIGN.CENTER,
        );
        Alert.alert('Error!', 'Data not received!');
        await BluetoothEscposPrinter.setBlob(0);
        await BluetoothEscposPrinter.printText('Bill Details not sent.\n\r', {
          encoding: 'GBK',
          codepage: 0,
          widthtimes: 0,
          heigthtimes: 0,
          fonttype: 3,
        });
      }
    });
  headData = [];
  bodyData = [];
  billType = '';

  return null;
};

export default App;

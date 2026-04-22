export async function saveTransaction(data: {
  customer: string;
  mobile: string;
  tableNo: number;
  method: string;
  amount: number;
}) {
  await fetch('http://localhost:4000/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      date: new Date().toISOString(),
      customer: data.customer,
      mobile: data.mobile,
      table_no: data.tableNo,
      method: data.method,
      amount: data.amount
    })
  });
}

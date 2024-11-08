import { Link, useLoaderData } from "react-router-dom";

export async function loader() {
  const data = [
    await (await fetch("/api/user")).json(),
    await (await fetch("/api/barcodes")).json(),
  ];

  return { loggedIn: data[0].loggedIn, barcodes: data[1] };
}

export default function Barcodes() {
  const { loggedIn, barcodes } = useLoaderData();
  const columns = ["barcode", "product name", "contributor"];

  return (
    <>
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {barcodes.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.values(row).map((value, valueIndex) => {
                if (valueIndex === 0) {
                  return (
                    <td key={valueIndex}>
                      <Link to={`/b/${row.barcode}`}>{value}</Link>
                    </td>
                  );
                } else {
                  return <td key={valueIndex}>{value}</td>;
                }
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* TODO: factor out this link */}
      {loggedIn ? <Link to="/add">Add</Link> : null}
    </>
  );
}

const Table = ({
    title,
    data,
    columns,
    columnFields,
    className = '',
    fallback = 'No data available',
}: {
    title: string;
    data: any[];
    columns: string[];
    columnFields: string[];
    className?: string;
    fallback?: string;
}) => (
    <div className={className}>
        {data.length > 0 ? (
            <>
                {title != '' && (
                    <h3 className="text-xl font-semibold mb-3">{title}</h3>
                )}
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className="text-left py-2 px-4 border-b"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                                {columnFields.map((col, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="py-2 px-4 border-b"
                                    >
                                        {row[col]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </>
        ) : (
            <p className="text-center">{fallback}</p>
        )}
    </div>
);

export default Table;

import { useCallback } from "react";
import Skeleton from 'react-loading-skeleton';

export default function TableBody(props) {
    const { finalData, columns, selectionType, dispatch, selectedRowsId, rowIdAccessor, currentRowId, emptyState, loading } = props;

    const checkHandler = useCallback((e, id) => {
        dispatch({
            type: "TOGGLE_SELECT_ROW_ID",
            payload: { id }
        });
    }, [dispatch]);

    const rowClickHandler = useCallback((id) => {
        dispatch({
            type: "SET_CURRENT_ROW_ID",
            payload: { id }
        })
    }, [dispatch]);

    const noOfColumns = columns.length + (selectionType === "multiple" ? 1 : 0) + 1;
    let bodyContent = finalData.map((row, i) => {
        const id = row[rowIdAccessor];
        const borderStyle = i === finalData.length - 1 ? "border-t" : "border-t border-b";
        const bgStyle = i % 2 === 0 ? "bg-base-odd" : "bg-base";
        return <tr key={i} className={`${borderStyle} ${bgStyle} ${selectedRowsId.has(id) ? 'selected-row' : ''} ${currentRowId === id ? "current-row" : ""}`}
            onClick={() => rowClickHandler(id)}>
            {selectionType === "multiple" && (
                <td className={`p-2 sticky left-0 ${bgStyle} row-select-checkbox`}>
                    <input type="checkbox" aria-label="select row" onChange={e => checkHandler(e, id)} isSelected={selectedRowsId.has(id)} />
                </td>
            )}
            {columns.map((column, index) => {
                const borderStyle = index === columns.length - 1 ? "" : "border-r";
                return (
                    <td key={index} className={`${borderStyle}  p-2 overflow-hidden`}>
                        {column.renderRow ? column.renderRow(row) : <span className="text-sm">{row[column.accessor].toString()}</span>}
                    </td>
                );
            })}
            <td />
        </tr>
    })
    console.log(loading, finalData.length, emptyState);
    if (loading || (finalData.length === 0 && !emptyState)) {
        bodyContent = (
            <tr>
                <td colSpan={noOfColumns}>
                    <Skeleton count={15} height={40} />
                </td>
            </tr >
        );
    }

    return (
        <tbody>
            {bodyContent}
        </tbody>
    )
}
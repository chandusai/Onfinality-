import TableBody from "./table-body";
import TableHead from "./table-head";
import "./style.css";
import { useEffect } from "react";
import { enableMapSet } from "immer";
import { useRef } from "react";
import { useImmerReducer } from "use-immer";
import reducer, { initialState } from "./reducer";
import { data } from "autoprefixer";

enableMapSet();

export default function Table(props) {

    const {
        tfoot,
        theme = { darkMode: false, actionColor: "#7986CB", colWidth: "200px" },
        ...options
    } = props;


    const [state, dispatch] = useImmerReducer(reducer, initialState);
    const { finalData, selectedRowsId, currentRowId, isSelectAll, rowIdAccessor, selectionType, sortBy, columns, emptyState, showFilter, loading } = state;
    const tableContainerRef = useRef(null);

    useEffect(() => {
        dispatch({
            type: "INIT",
            payload: { ...options }
        })
        if (tableContainerRef.current) {
            tableContainerRef.current.style.setProperty("--actionColor", theme.actionColor);
            tableContainerRef.current.style.setProperty("--actionColorBase", `${theme.actionColor}33`);
            tableContainerRef.current.style.setProperty("--colWidth", theme.colWidth);
        }
    }, []);

    useEffect(() => {
        dispatch({
            type: "TABLE_DATA",
            payload: { data: options.data, loading: options.loading }
        });
    }, [options.data, options.loading]);


    return (
        <div className={`max-h-full bg-base overflow-x-auto border h-full ${theme.darkMode ? "dark" : "light"}`} ref={tableContainerRef}>
            <table className="table h-full w-full table-fixed overflow-y-auto relative">
                <TableHead isSelectAll={isSelectAll} dispatch={dispatch} columns={columns} selectionType={selectionType}
                    rowIdAccessor={rowIdAccessor} finalData={finalData} sortBy={sortBy} showFilter={showFilter} />
                <TableBody columns={columns} selectionType={selectionType} selectedRowsId={selectedRowsId} loading={loading}
                    rowIdAccessor={rowIdAccessor} finalData={finalData} dispatch={dispatch} currentRowId={currentRowId}
                    emptyState={emptyState} actionColor={theme.actionColor} />
                <tfoot className="sticky bottom-0 border-t bg-white">
                    {tfoot && tfoot()}
                </tfoot>
            </table>
        </div>
    )
}

export class Column {
    constructor(col) {
        this.value = col.value;
        this.accessor = col.accessor;
        this.renderRow = col.renderRow;
        this.renderColumn = col.renderColumn;
        this.sortable = !!col.sortable;
        this.sortData = col.sortData;
        this.renderFilter = col.renderFilter;
    }
}

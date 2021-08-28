import React, { useRef } from "react";
import { useDrag } from 'react-use-gesture';
import { useState } from "react";
import { useCallback } from "react";
import { useMemo } from "react";


function Th(props) {
    const { children, className } = props;
    const ref = useRef(null);
    const [width, setWidth] = useState(null);

    const bind = useDrag(({ active, movement: [x,] }) => {
        if (ref.current) {
            if (active && width === null) {
                setWidth(ref.current.offsetWidth);
            }
            if (width) {
                ref.current.style.width = `${width + x}px`;
            }
            if (!active) {
                setWidth(null);
            }
        }
    });

    return (
        <th ref={ref} className={className}>
            {children}
            <div role="separator" {...bind()} className="absolute top-0 right-0 w-1 h-full" style={{ cursor: "col-resize" }} />
        </th>
    )
}

export default React.memo(function TableHead(props) {
    const { columns, selectionType, isSelectAll, dispatch, sortBy, showFilter } = props;

    const { isSelected, isIndeterminate } = useMemo(() => {
        const data = { isSelected: false, isIndeterminate: false };
        if (isSelectAll === "indeterminate") {
            data.isIndeterminate = true;
        } else {
            data.isSelected = isSelectAll;
        }
        return data;
    }, [isSelectAll]);

    const toggleSelectAll = useCallback(checked => {
        dispatch({
            type: "TOGGLE_SELECT_ALL",
            payload: { checked }
        });
    }, [dispatch]);

    const thClickHandler = useCallback((index) => {
        dispatch({
            type: "TH_CLICK",
            payload: { index }
        });
    }, [dispatch]);

    return (
        <thead className="sticky top-0 bg-base select-none z-10">
            <tr>
                {selectionType === "multiple" && (
                    <th className="w-8 cursor-pointer sticky left-0 bg-base row-select-checkbox">
                        <input type="checkbox" aria-label="select all rows" onChange={toggleSelectAll} isSelected={isSelected} isIndeterminate={isIndeterminate} />
                    </th>
                )}
                {columns.map((column, index) => {

                    let thContent = <span className="text-sm uppercase font-semibold">{column.value}</span>;
                    if (column.renderColumn) {
                        thContent = column.renderColumn();
                    }
                    const borderStyle = index === columns.length - 1 ? "" : "border-r";
                    return (
                        <Th key={index} className={`relative p-2 text-left text-color cursor-pointer col-width ${borderStyle} overflow-hidden`}>
                            <div className="flex items-center h-full w-full th-content" onClick={() => thClickHandler(index)}>
                                {thContent}
                                {
                                    column.sortable && sortBy?.index === index && <span className="material-icons">
                                        {sortBy?.order === "asce" ? "arrow_drop_down" : "arrow_drop_up"}</span>
                                }
                            </div>
                        </Th>
                    )
                })}
                <th className="w-0" />
            </tr>
            {showFilter && (
                <tr className="relative -top-px filter-row">
                    {selectionType === "multiple" && (
                        <th className="w-8 cursor-pointer sticky left-0 bg-base row-select-checkbox" />
                    )}
                    {
                        columns.map((column, index) => {
                            const borderStyle = index === columns.length - 1 ? "" : "border-r";
                            return (<th key={index} className={`relative p-2 text-left text-color cursor-pointer col-width border-t ${borderStyle} overflow-hidden`}>
                                {column.renderFilter && (
                                    <div className="flex gap-2 items-center">
                                        <div className="flex-1">
                                            {column.renderFilter()}
                                        </div>
                                        <span className="material-icons text-gray-700">filter_alt</span>
                                    </div>
                                )}
                            </th>)
                        })
                    }
                </tr>
            )}
        </thead>
    );
});
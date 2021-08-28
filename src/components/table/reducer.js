export const initialState = {
    data: [],
    columns: [],
    finalData: [],
    selectedRowsId: new Set(),
    currentRowId: undefined,
    rowIdAccessor: "",
    isSelectAll: false,
    selectionType: "single",
    sortBy: undefined,
    emptyState: undefined,
    showFilter: false,
    loading: false
};

const isSelectAll = ({ finalData, rowIdAccessor, selectedRowsId }) => {

    let anyFalse = false;
    let anyTrue = false;
    for (const id of finalData.map(row => row[rowIdAccessor])) {
        if (!selectedRowsId.has(id)) {
            anyFalse = true;
        } else {
            anyTrue = true;
        }
        if (anyTrue && anyFalse) {
            break;
        }
    }
    if (!anyFalse) {
        return true;
    } else if (!anyTrue) {
        return false;
    }
    return "indeterminate";
}

export default function reducer(draft, action) {
    switch (action.type) {
        case "INIT": {
            const { selectedRowsId = new Set(), data, currentRowId, rowIdAccessor, selectionType = "single", columns, showFilter = false, loading } = action.payload;
            draft.selectedRowsId = selectedRowsId;
            draft.finalData = data;
            draft.data = data;
            draft.currentRowId = currentRowId;
            draft.rowIdAccessor = rowIdAccessor;
            draft.isSelectAll = isSelectAll(draft);
            draft.selectionType = selectionType;
            draft.showFilter = showFilter;
            draft.columns = columns;
            draft.emptyState = undefined;
            draft.loading = loading;
            if (!loading) {
                if (data.length === 0) {
                    draft.emptyState = "EMPTY_DATA";
                } else if (draft.finalData.length === 0) {
                    draft.emptyState = "EMPTY_FINAL_DATA";
                };
            }
            return;
        }
        case "TABLE_DATA": {
            const { data, loading } = action.payload;
            draft.finalData = data;
            draft.loading = loading;
            if (!loading) {
                if (data.length === 0) {
                    draft.emptyState = "EMPTY_DATA";
                } else if (draft.finalData.length === 0) {
                    draft.emptyState = "EMPTY_FINAL_DATA";
                };
            }
            return;
        }
        case "TOGGLE_SELECT_ALL": {
            const { checked } = action.payload;
            if (checked) {
                draft.finalData.filter(row => row[draft.rowIdAccessor] !== undefined).forEach(row => {
                    draft.selectedRowsId.add(row[draft.rowIdAccessor]);
                });
            } else {
                draft.selectedRowsId.clear();
            }
            draft.isSelectAll = checked;
            return;
        }
        case "TOGGLE_SELECT_ROW_ID": {
            const { id } = action.payload;
            if (draft.selectedRowsId.has(id)) {
                draft.selectedRowsId.delete(id);
            } else {
                draft.selectedRowsId.add(id);
            }
            draft.isSelectAll = isSelectAll(draft);
            draft.currentRowId = id;
            return;
        }
        case "SET_CURRENT_ROW_ID": {
            const { id } = action.payload;
            draft.currentRowId = id;
            if (draft.selectionType === "single") {
                draft.selectedRowsId.clear();
                draft.selectedRowsId.add(id);
            }
            return;
        }
        case "TH_CLICK": {
            const { index } = action.payload;
            if (draft.sortBy?.index === index) {
                const sortBy = {
                    index,
                    order: (draft.sortBy?.order === "desc" ? "asce" : "desc")
                }
                draft.sortBy = sortBy;
            } else {
                draft.sortBy = {
                    index,
                    order: "asce"
                }
            }
            const { sortData, sortable } = draft.columns[index];
            if (sortable && sortData) {
                draft.finalData = sortData(draft.finalData, draft.sortBy.order);
            }
            return;
        }
        default:
            throw new Error();
    }
};
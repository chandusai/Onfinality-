import { useLazyQuery } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactJson from "react-json-view";
import Table, { Column } from "./components/table";
import { GET_EVENTS } from "./queries/events";
import { useImmer } from "use-immer";

export default function App() {
  const [getEvents, { loading, data = {} }] = useLazyQuery(GET_EVENTS);
  const [pageNumber, setPageNumber] = useState(1);
  const [filter, setFilter] = useImmer({});

  const {
    nodes = [],
    pageInfo,
    totalCount,
  } = useMemo(() => {
    const { events = {} } = JSON.parse(JSON.stringify(data));
    (events?.nodes || []).forEach((node) => {
      node.data.forEach((d) => {
        try {
          d.value = JSON.parse(d.value);
        } catch (e) {
          console.log(d);
        }
      });
    });
    return {
      nodes: events.nodes,
      pageInfo: events.pageInfo,
      totalCount: events.totalCount,
    };
  }, [data]);

  useEffect(() => {
    getEvents({ variables: { first: 50, offset: 0 } });
  }, []);

  const filterHandler = useCallback(
    (value, key) => {
      setPageNumber(1);
      setFilter((draft) => {
        draft[key] = {
          includes: value,
        };
        if (draft[key] && !value.trim()) {
          delete draft[key];
        }
        const variables = { first: 50, offset: 0 };
        const filter = JSON.parse(JSON.stringify(draft));
        if (Object.keys(filter).length) {
          variables.filter = filter;
        }
        getEvents({ variables });
      });
    },
    [setFilter, setPageNumber, getEvents]
  );

  const columns = useMemo(() => {
    return [
      new Column({
        value: "Block Number",
        accessor: "blockNumber",
      }),
      new Column({
        value: "Extrinsic Id",
        accessor: "extrinsicId",
      }),
      new Column({
        value: "Section",
        accessor: "section",
        renderFilter: () => {
          return (
            <input
              className="w-full text-sm border h-8 rounded-sm border-gray-400 px-2"
              onBlur={(e) => filterHandler(e.target.value, "section")}
            />
          );
        },
      }),
      new Column({
        value: "Method",
        accessor: "method",
        renderFilter: () => {
          return (
            <input
              className="w-full text-sm border h-8 rounded-sm border-gray-400 px-2"
              onBlur={(e) => filterHandler(e.target.value, "method")}
            />
          );
        },
      }),
      new Column({
        value: "Data",
        accessor: "data",
        renderRow: ({ data }) => {
          return (
            <div>
              <ReactJson src={data} />
            </div>
          );
        },
      }),
    ];
  }, []);

  const pageClickHandler = useCallback(
    (pageNumber) => {
      const offset = (pageNumber - 1) * 50;
      const variables = { first: 50, offset };
      if (Object.keys(filter).length) {
        variables.filter = filter;
      }
      getEvents({ variables });
      setPageNumber(pageNumber);
    },
    [setPageNumber, getEvents, filter]
  );

  return (
    <main className="h-screen w-screen flex flex-col p-5 gap-3">
      <span className="title">Event List</span>
      <div className="flex flex-col flex-1 overflow-hidden">
        <Table
          data={nodes}
          rowIdAccessor="id"
          columns={columns}
          showFilter={true}
          loading={loading}
          tfoot={() => {
            const totalPages = Math.ceil(totalCount / 50) || 0;
            const nextPageStyle = pageInfo?.hasNextPage
              ? "text-gray-700 cursor-pointer"
              : "text-gray-400 cursor-not-allowed";
            const prevPageStyle = pageInfo?.hasPreviousPage
              ? "text-gray-700 cursor-pointer"
              : "text-gray-400 cursor-not-allowed";
            const firstPageStyle =
              pageNumber !== 1
                ? "text-gray-700 cursor-pointer"
                : "text-gray-400 cursor-not-allowed";
            const lastPageStyle =
              pageNumber !== totalPages
                ? "text-gray-700 cursor-pointer"
                : "text-gray-400 cursor-not-allowed";
            return (
              <tr>
                <td colSpan={columns.length + 1}>
                  <div className="flex gap-5 items-center px-5">
                    <span className="caption text-gray-700">
                      Result Per page 50
                    </span>
                    <div className="flex items-center">
                      <span
                        className={`material-icons ${firstPageStyle}`}
                        onClick={() => pageClickHandler(1)}
                      >
                        first_page
                      </span>
                      <span
                        className={`material-icons ${prevPageStyle}`}
                        onClick={() => pageClickHandler(pageNumber - 1)}
                      >
                        navigate_before
                      </span>
                      <span className="caption text-gray-700">
                        Page {pageNumber} of {totalPages}
                      </span>
                      <span
                        className={`material-icons ${nextPageStyle}`}
                        onClick={() => pageClickHandler(pageNumber + 1)}
                      >
                        navigate_next
                      </span>
                      <span
                        className={`material-icons ${lastPageStyle}`}
                        onClick={() => pageClickHandler(totalPages)}
                      >
                        last_page
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            );
          }}
        />
      </div>
    </main>
  );
}

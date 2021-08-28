import { gql, useQuery } from '@apollo/client';

export const GET_EVENTS = gql`
    query GetEvents($first:Int, $offset: Int, $filter:EventFilter) {
        events(first:$first, offset:$offset, filter:$filter){
            nodes{
                id,
                section,
                method,
                data,
                blockNumber,
                extrinsicId
            },
             pageInfo{
                hasNextPage,
                hasPreviousPage,
                startCursor,
                endCursor
            },
            totalCount
        }
    }
`;
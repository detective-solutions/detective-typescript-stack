import { gql } from 'apollo-angular';

export const connectionsCountSubscriptionGQL = gql`
  subscription onConnectionChanged {
    aggregateSourceConnection {
      count
    }
  }
`;

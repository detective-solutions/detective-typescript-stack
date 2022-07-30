import { gql } from 'apollo-angular';

export const connectionsSubscriptionGQL = gql`
  subscription onConnectionChanged {
    querySourceConnection {
      xid
      name
      description
      connectorName
      status
    }
  }
`;

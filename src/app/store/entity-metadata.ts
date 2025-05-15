import { EntityMetadataMap } from '@ngrx/data';

const entityMetadata: EntityMetadataMap = {
  Page: {
  },
  Action: {
  },
  PageAction: {
  },
  Category: {
  }
};

const pluralNames = { Category: 'Categories' };

export const entityConfig = {
  entityMetadata,
  pluralNames
};

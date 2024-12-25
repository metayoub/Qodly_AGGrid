import { ESetting, TSetting } from '@ws-ui/webform-editor';
import { BASIC_SETTINGS, DEFAULT_SETTINGS, load } from '@ws-ui/webform-editor';
import { validateServerSide } from '@ws-ui/shared';

// TODO: add selected element color
const commonSettings: TSetting[] = [
  {
    key: 'name',
    label: 'Name',
    type: ESetting.TEXT_FIELD,
    defaultValue: 'Qodly',
  },
  {
    type: ESetting.DATAGRID,
    key: 'columns',
    label: 'Columns',
    titleProperty: 'title',
    data: [
      {
        label: 'Title',
        defaultValue: '',
        type: ESetting.TEXT_FIELD,
        key: 'title',
      },
      {
        label: 'Source',
        // defaultValue: '',
        type: ESetting.DS_AUTO_SUGGEST,
        key: 'source',
      },
      {
        label: 'Format',
        defaultValue: '',
        type: ESetting.FORMAT_FIELD,
        key: 'format',
        labelClassName: 'mr-4 ml-2 w-16',
        className: 'mb-2',
      },
      {
        label: 'Width',
        type: ESetting.NUMBER_FIELD,
        defaultValue: 150,
        key: 'width',
      },
      {
        label: 'Enable Sorting',
        defaultValue: false,
        type: ESetting.CHECKBOX,
        key: 'sorting',
      },
      {
        label: 'Enable Hiding',
        defaultValue: true,
        type: ESetting.CHECKBOX,
        key: 'hidden',
      },
      {
        label: 'Enable Sizing',
        defaultValue: true,
        type: ESetting.CHECKBOX,
        key: 'sizing',
      },
    ],
  },
];

const dataAccessSettings: TSetting[] = [
  {
    key: 'datasource',
    label: 'Qodly Source',
    type: ESetting.DS_AUTO_SUGGEST,
  },
  {
    key: 'currentElement',
    label: 'Selected Element',
    type: ESetting.DS_AUTO_SUGGEST,
  },
  {
    key: 'serverSideRef',
    label: 'Server Side',
    type: ESetting.TEXT_FIELD,
    hasError: validateServerSide,
    validateOnEnter: true,
  },
];

const Settings: TSetting[] = [
  {
    key: 'properties',
    label: 'Properties',
    type: ESetting.GROUP,
    components: commonSettings,
  },
  {
    key: 'dataAccess',
    label: 'Data Access',
    type: ESetting.GROUP,
    components: dataAccessSettings,
  },
  ...load(DEFAULT_SETTINGS).filter('dataAccess'),
];

export const BasicSettings: TSetting[] = [
  ...commonSettings,
  ...dataAccessSettings,
  ...load(BASIC_SETTINGS).filter('style.overflow', 'serverSideRef'),
];

export default Settings;

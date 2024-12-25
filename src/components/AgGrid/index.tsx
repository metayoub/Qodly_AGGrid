import config, { IAgGridProps } from './AgGrid.config';
import { T4DComponent, useEnhancedEditor } from '@ws-ui/webform-editor';
import Build from './AgGrid.build';
import Render from './AgGrid.render';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);
// To minimize bundle size, only register the modules you want to use. See the Modules page for more information.
const AgGrid: T4DComponent<IAgGridProps> = (props) => {
  const { enabled } = useEnhancedEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return enabled ? <Build {...props} /> : <Render {...props} />;
};

AgGrid.craft = config.craft;
AgGrid.info = config.info;
AgGrid.defaultProps = config.defaultProps;

export default AgGrid;
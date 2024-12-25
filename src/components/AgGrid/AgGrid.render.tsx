import {
  useDataLoader,
  useRenderer,
  useSources,
  useDsChangeHandler,
  entitySubject,
  EntityActions,
  useEnhancedNode,
} from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useCallback, useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { IAgGridProps } from './AgGrid.config';
import { ColDef } from 'ag-grid-community';

const AgGrid: FC<IAgGridProps> = ({ columns, style, className, classNames = [] }) => {
  const { connect } = useRenderer();
  const {
    sources: { datasource, currentElement },
  } = useSources({ acceptIteratorSel: true });
  const { id: nodeID } = useEnhancedNode();

  const { entities, fetchIndex, page } = useDataLoader({
    source: datasource,
  });

  const [rowData, setRowData] = useState<any[]>([]);
  const [selected, setSelected] = useState(-1);
  const [_scrollIndex, setScrollIndex] = useState(0);
  const [count, setCount] = useState(0);
  const colDefs: ColDef[] = columns.map((col) => ({ field: col.title }));

  const { updateCurrentDsValue } = useDsChangeHandler({
    source: datasource,
    currentDs: currentElement,
    selected,
    setSelected,
    setScrollIndex,
    setCount,
    fetchIndex,
    onDsChange: (length, selected) => {
      if (selected >= 0) {
        updateCurrentDsValue({
          index: selected < length ? selected : 0,
          forceUpdate: true,
        });
      }
    },
    onCurrentDsChange: (selected) => {
      entitySubject.next({
        action: EntityActions.UPDATE,
        payload: {
          nodeID,
          rowIndex: selected,
        },
      });
    },
  });

  useEffect(() => {
    if (!datasource) return;

    const listener = async (/* event */) => {
      await fetchIndex(0);
    };

    listener();

    datasource.addListener('changed', listener);

    return () => {
      datasource.removeListener('changed', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasource]);

  useEffect(() => {
    if (page.fetching) return;

    setRowData(
      entities.map((data: any) => {
        const row: any = {};
        columns.forEach((col) => {
          row[col.title] = data[col.source];
        });
        return row;
      }),
    );
  }, [entities]);

  const selectRow = useCallback(async (event: any) => {
    if (!datasource || !currentElement) return;
    await updateCurrentDsValue({
      index: event.rowIndex,
    });
  }, []);

  const getRowStyle = (params: any) => {
    if (params.node.rowIndex === selected) {
      return { backgroundColor: 'lightblue' }; // TODO: make this configurable
    }
    return undefined;
  };

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        onRowClicked={selectRow}
        getRowStyle={getRowStyle}
      />
    </div>
  );
};

export default AgGrid;

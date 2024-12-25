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
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { IAgGridProps } from './AgGrid.config';
import { ColDef, GridReadyEvent, IGetRowsParams } from 'ag-grid-community';

const AgGrid: FC<IAgGridProps> = ({ columns, style, className, classNames = [] }) => {
  const { connect } = useRenderer();
  const {
    sources: { datasource, currentElement },
  } = useSources({ acceptIteratorSel: true });
  const { id: nodeID } = useEnhancedNode();
  const rowDataRef = useRef<any[]>([]);
  const { fetchIndex } = useDataLoader({
    source: datasource,
  });
  const [selected, setSelected] = useState(-1);
  const [_scrollIndex, setScrollIndex] = useState(0);
  const [count, setCount] = useState(0);
  const colDefs: ColDef[] = columns.map((col) => ({ field: col.title }));
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: 100,
      sortable: false,
    };
  }, []);

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

  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      params.api.setGridOption('datasource', {
        getRows: async (params: IGetRowsParams) => {
          const entities = await fetchIndex(params.startRow);
          rowDataRef.current = entities.map((data: any) => {
            const row: any = {};
            columns.forEach((col) => {
              row[col.title] = data[col.source];
            });
            return row;
          });
          if (Array.isArray(entities)) {
            params.successCallback(rowDataRef.current, count);
          } else {
            params.failCallback();
          }
        },
      });
    },
    [count],
  );

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <AgGridReact
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        onRowClicked={selectRow}
        getRowStyle={getRowStyle}
        onGridReady={onGridReady}
        rowModelType="infinite"
        cacheBlockSize={100}
        maxBlocksInCache={10}
        cacheOverflowSize={2}
        maxConcurrentDatasourceRequests={1}
        infiniteInitialRowCount={count}
        rowBuffer={0}
      />
    </div>
  );
};

export default AgGrid;

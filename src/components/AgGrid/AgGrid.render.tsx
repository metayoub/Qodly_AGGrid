import {
  useDataLoader,
  useRenderer,
  useSources,
  useDsChangeHandler,
  entitySubject,
  EntityActions,
  useEnhancedNode,
  useWebformPath,
} from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { IAgGridProps } from './AgGrid.config';
import {
  ColDef,
  GridReadyEvent,
  IGetRowsParams,
  RowClassParams,
  SortModelItem,
  StateUpdatedEvent,
} from 'ag-grid-community';
import isEqual from 'lodash/isEqual';
import CustomCell from './CustomCell';

const AgGrid: FC<IAgGridProps> = ({ columns, state, style, className, classNames = [] }) => {
  const { connect, emit } = useRenderer({
    omittedEvents: ['onselect', 'onclick', 'onheaderclick', 'oncellclick', 'onsavestate'],
  });
  const {
    sources: { datasource, currentElement },
  } = useSources({ acceptIteratorSel: true });
  const { id: nodeID } = useEnhancedNode();
  const rowDataRef = useRef<any[]>([]);
  const prevSortModelRef = useRef<SortModelItem[]>([]);
  const { fetchIndex } = useDataLoader({
    source: datasource,
  });
  const path = useWebformPath();
  const stateDS = window.DataSource.getSource(state, path);
  const [selected, setSelected] = useState(-1);
  const [_scrollIndex, setScrollIndex] = useState(0);
  const [count, setCount] = useState(0);
  const colDefs: ColDef[] = useMemo(
    () =>
      columns.map((col) => ({
        field: col.title,
        cellRendererParams: {
          format: col.format,
          dataType: col.dataType,
        },
        sortable: col.sorting,
        resizable: col.sizing,
        width: col.width,
        flex: col.flex,
        filter:
          col.filtering &&
          (col.dataType === 'text' || col.dataType === 'string'
            ? 'agTextColumnFilter'
            : col.dataType === 'long' || col.dataType === 'number'
              ? 'agNumberColumnFilter'
              : col.dataType === 'date'
                ? 'agDateColumnFilter'
                : false),
      })),
    [],
  );

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      minWidth: 100,
      sortingOrder: ['asc', 'desc'],
      cellRenderer: CustomCell,
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
    emit('onselect');
  }, []);

  const selectCell = useCallback((event: any) => {
    emit('oncellclick', {
      column: event.column.getColId(),
      value: event.value,
    });
  }, []);

  const selectHeader = useCallback((event: any) => {
    emit('onheaderclick', {
      column: event.column,
    });
  }, []);

  const getRowStyle = useCallback(
    (params: RowClassParams) => {
      if (params.node.rowIndex === selected) {
        return { backgroundColor: 'lightblue' }; // TODO: make this configurable
      }
      return undefined;
    },
    [selected],
  );

  const stateUpdated = useCallback((params: StateUpdatedEvent) => {
    if (stateDS && params.type === 'stateUpdated') {
      stateDS.setValue(null, params.api.getColumnState());
      emit('onsavestate', params.api.getColumnState());
    }
  }, []);

  const getState = useCallback(async (params: GridReadyEvent) => {
    if (stateDS) {
      const dsValue = await stateDS?.value;
      params.api.applyColumnState({ state: dsValue });
    }
  }, []);

  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      getState(params);
      params.api.setGridOption('datasource', {
        getRows: async (params: IGetRowsParams) => {
          if (!isEqual(params.filterModel, {})) {
            //TODO: foreach key in filterModel, apply filter
          }
          if (params.sortModel.length > 0 && !isEqual(params.sortModel, prevSortModelRef.current)) {
            prevSortModelRef.current = params.sortModel;
            const sortingString = params.sortModel
              .map((sort) => `${columns.find((c) => c.title === sort.colId)?.source} ${sort.sort}`)
              .join(', ');
            await datasource.orderBy(sortingString);
          }
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
        onStateUpdated={stateUpdated}
        onCellClicked={selectCell}
        onColumnHeaderClicked={selectHeader}
      />
    </div>
  );
};

export default AgGrid;

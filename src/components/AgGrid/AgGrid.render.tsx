import {
  useDataLoader,
  useRenderer,
  useSources,
  useDsChangeHandler,
  entitySubject,
  EntityActions,
  useEnhancedNode,
  useWebformPath,
  dateTo4DFormat,
} from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { IAgGridProps } from './AgGrid.config';
import {
  ColDef,
  GridReadyEvent,
  IGetRowsParams,
  SortModelItem,
  StateUpdatedEvent,
  themeQuartz,
} from 'ag-grid-community';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import CustomCell from './CustomCell';

const AgGrid: FC<IAgGridProps> = ({
  datasource,
  columns,
  state = '',
  spacing,
  accentColor,
  backgroundColor,
  textColor,
  fontSize,
  borderColor,
  wrapperBorderRadius,
  oddRowBackgroundColor,
  rowBorder,
  columnBorder,
  headerBackgroundColor,
  headerTextColor,
  headerColumnBorder,
  headerVerticalPaddingScale,
  headerFontSize,
  headerFontWeight,
  cellHorizontalPaddingScale,
  rowVerticalPaddingScale,
  iconSize,
  style,
  className,
  classNames = [],
}) => {
  const { connect, emit } = useRenderer({
    omittedEvents: ['onselect', 'onclick', 'onheaderclick', 'oncellclick', 'onsavestate'],
  });
  const {
    sources: { datasource: ds, currentElement },
  } = useSources({ acceptIteratorSel: true });
  const { id: nodeID } = useEnhancedNode();
  const prevSortModelRef = useRef<SortModelItem[]>([]);
  const searchDs = useMemo(() => {
    if (ds) {
      const clone: any = cloneDeep(ds);
      clone.id = `${clone.id}_clone`;
      clone.children = {};
      return clone;
    }
    return null;
  }, [ds?.id, (ds as any)?.entitysel]);

  const { fetchIndex } = useDataLoader({
    source: ds,
  });

  const { fetchIndex: fetchIndexClone } = useDataLoader({
    source: searchDs,
  });

  const path = useWebformPath();
  const stateDS = window.DataSource.getSource(state, path);

  const [selected, setSelected] = useState(-1);
  const [_scrollIndex, setScrollIndex] = useState(0);
  const [count, setCount] = useState(1);
  const colDefs: ColDef[] = useMemo(
    () =>
      columns.map((col) => ({
        field: col.title,
        cellRendererParams: {
          format: col.format,
          dataType: col.dataType,
        },
        sortable: col.dataType !== 'image' && col.dataType !== 'object' && col.sorting,
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
        filterParams: {
          filterOptions:
            col.dataType === 'text' || col.dataType === 'string'
              ? ['contains', 'equals', 'notEqual', 'startsWith', 'endsWith']
              : col.dataType === 'long' || col.dataType === 'number'
                ? [
                    'equals',
                    'notEqual',
                    'greaterThan',
                    'greaterThanOrEqual',
                    'lessThan',
                    'lessThanOrEqual',
                    'inRange',
                  ]
                : col.dataType === 'date'
                  ? ['equals', 'notEqual', 'greaterThan', 'lessThan', 'inRange']
                  : [],
          defaultOption: 'equals',
        },
      })),
    [],
  );

  console.log('colDefs', colDefs);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      minWidth: 100,
      sortingOrder: ['asc', 'desc'],
      cellRenderer: CustomCell,
    };
  }, []);

  const theme = themeQuartz.withParams({
    spacing,
    accentColor,
    backgroundColor,
    textColor,
    fontSize,
    oddRowBackgroundColor,
    borderColor,
    rowBorder,
    columnBorder,
    wrapperBorderRadius,
    headerBackgroundColor,
    headerTextColor,
    headerColumnBorder,
    headerVerticalPaddingScale,
    headerFontSize,
    headerFontWeight,
    cellHorizontalPaddingScale,
    rowVerticalPaddingScale,
    iconSize,
    foregroundColor: textColor,
    borderRadius: wrapperBorderRadius,
    rangeSelectionBorderColor: 'transparent',
  });

  const { updateCurrentDsValue } = useDsChangeHandler({
    source: ds,
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
    if (!ds) return;

    const listener = async (/* event */) => {
      await fetchIndex(0);
    };

    listener();

    ds.addListener('changed', listener);

    return () => {
      ds.removeListener('changed', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ds]);

  const selectRow = useCallback(async (event: any) => {
    if (!ds) return;
    event.api.getSelectedRows();
    await updateCurrentDsValue({
      index: event.rowIndex,
    });
    emit('onselect');
  }, []);

  const selectCell = useCallback((event: any) => {
    if (!ds) return;
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

  const stateUpdated = useCallback((params: StateUpdatedEvent) => {
    if (stateDS && params.type === 'stateUpdated') {
      stateDS.setValue(null, params.api.getColumnState());
      emit('onsavestate', params.api.getColumnState());
    }
  }, []);

  const getState = useCallback(async (params: GridReadyEvent) => {
    if (stateDS) {
      const dsValue = await stateDS?.getValue();
      params.api.applyColumnState({ state: dsValue });
    }
  }, []);

  const buildFilterQuery = useCallback((filter: any, source: string): string => {
    const filterType = filter.filterType;
    const filterValue = filter.filter;
    switch (filterType) {
      case 'text':
        switch (filter.type) {
          case 'contains':
            return `${source} == @${filterValue}@`;
          case 'equals':
            return `${source} == ${filterValue}`;
          case 'notEqual':
            return `${source} != '${filterValue}'`;
          case 'startsWith':
            return `${source} begin ${filterValue}`;
          case 'endsWith':
            return `${source} == @${filterValue}`;
          default:
            return '';
        }
      case 'number':
        switch (filter.type) {
          case 'equals':
            return `${source} == ${filterValue}`;
          case 'notEqual':
            return `${source} != ${filterValue}`;
          case 'greaterThan':
            return `${source} > ${filterValue}`;
          case 'greaterThanOrEqual':
            return `${source} >= ${filterValue}`;
          case 'lessThan':
            return `${source} < ${filterValue}`;
          case 'lessThanOrEqual':
            return `${source} <= ${filterValue}`;
          case 'inRange':
            return `${source} >= ${filter.filter} AND ${source} <= ${filter.filterTo}`;
          default:
            return '';
        }
      case 'date':
        switch (filter.type) {
          case 'equals':
            return `${source} == "${new Date(filter.dateFrom)}"`;
          case 'notEqual':
            return `${source} != "${new Date(filter.dateFrom)}"`;
          case 'lessThan':
            return `${source} < "!!2024-27-2!!"`;
          case 'greaterThan':
            return `${source} > "${new Date(filter.dateFrom)}"`;
          case 'inRange':
            return `${source} > "${dateTo4DFormat(new Date(filter.dateFrom))}" AND ${source} < "${dateTo4DFormat(new Date(filter.dateTo))}"`;
          default:
            return '';
        }
      default:
        return '';
    }
  }, []);

  const buildFilterQueries = useCallback(
    (filterModel: any, columns: any[]): string[] => {
      return Object.keys(filterModel).map((key) => {
        const filter = filterModel[key];
        const column = columns.find((col) => col.title === key);
        if (!column) return '';
        const source = column.source;
        if (filter.operator && filter.conditions) {
          const conditionQueries = filter.conditions.map((condition: any) =>
            buildFilterQuery(condition, source),
          );
          return `(${conditionQueries.join(` ${filter.operator} `)})`;
        } else {
          return buildFilterQuery(filter, source);
        }
      });
    },
    [buildFilterQuery],
  );

  const applySorting = useCallback(async (params: IGetRowsParams, columns: any[], ds: any) => {
    if (params.sortModel.length > 0 && !isEqual(params.sortModel, prevSortModelRef.current)) {
      prevSortModelRef.current = params.sortModel;
      const sortingString = params.sortModel
        .map((sort) => `${columns.find((c) => c.title === sort.colId)?.source} ${sort.sort}`)
        .join(', ');
      await ds.orderBy(sortingString);
    }
  }, []);

  const fetchData = useCallback(async (fetchIndex: any, params: IGetRowsParams) => {
    const entities = await fetchIndex(params.startRow);
    const rowData = entities.map((data: any) => {
      const row: any = {};
      columns.forEach((col) => {
        row[col.title] = data[col.source];
      });
      return row;
    });
    return { entities, rowData };
  }, []);

  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      getState(params);

      params.api.setGridOption('datasource', {
        getRows: async (params: IGetRowsParams) => {
          let entities = null;
          let length = count;
          let rowData: any[] = [];
          if (!isEqual(params.filterModel, {})) {
            const filterQueries = buildFilterQueries(params.filterModel, columns);
            const queryStr = filterQueries.filter(Boolean).join(' AND ');

            const { entitysel } = searchDs as any;
            const dataSetName = entitysel?.getServerRef();
            (searchDs as any).entitysel = searchDs.dataclass.query(queryStr, {
              dataSetName,
              filterAttributes: searchDs.filterAttributesText || searchDs._private.filterAttributes,
            });

            await applySorting(params, columns, searchDs);

            const result = await fetchData(fetchIndexClone, params);
            entities = result.entities;
            rowData = result.rowData;
            length = searchDs.entitysel._private.selLength;
          } else {
            await applySorting(params, columns, ds);

            const result = await fetchData(fetchIndex, params);
            entities = result.entities;
            rowData = result.rowData;
            length = count;
          }

          if (Array.isArray(entities)) {
            params.successCallback(rowData, length);
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
      {datasource ? (
        <AgGridReact
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          onRowClicked={selectRow}
          onGridReady={onGridReady}
          rowModelType="infinite"
          rowSelection={{ mode: 'singleRow', enableClickSelection: true, checkboxes: false }}
          cacheBlockSize={100}
          maxBlocksInCache={10}
          cacheOverflowSize={2}
          maxConcurrentDatasourceRequests={1}
          infiniteInitialRowCount={count}
          rowBuffer={0}
          onStateUpdated={stateUpdated}
          onCellClicked={selectCell}
          onColumnHeaderClicked={selectHeader}
          theme={theme}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center rounded-lg border bg-purple-400 py-4 text-white">
          <p>Error</p>
        </div>
      )}
    </div>
  );
};

export default AgGrid;

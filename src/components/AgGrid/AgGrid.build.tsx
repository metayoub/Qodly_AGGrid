import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { IAgGridProps } from './AgGrid.config';
import { ColDef, themeQuartz } from 'ag-grid-community';

const AgGrid: FC<IAgGridProps> = ({
  columns,
  spacing,
  accentColor,
  backgroundColor,
  textColor,
  fontSize,
  oddRowBackgroundColor,
  borderColor,
  wrapperBorderRadius,
  rowBorder,
  columnBorder,
  headerBackgroundColor,
  headerTextColor,
  headerColumnBorder,
  headerVerticalPaddingScale,
  headerFontSize,
  headerFontWeight,
  style,
  className,
  classNames = [],
}) => {
  const {
    connectors: { connect },
  } = useEnhancedNode();

  const colDefs: ColDef[] = columns.map((col) => ({ field: col.title }));
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: 100,
    };
  }, []);
  const rowData: any[] = Array.from({ length: 20 }, () => {
    const row: any = {};
    columns.forEach((col) => {
      row[col.title] = col.source;
    });
    return row;
  });

  const theme = themeQuartz.withParams({
    spacing,
    accentColor,
    backgroundColor,
    textColor,
    fontSize,
    borderColor,
    wrapperBorderRadius,
    rowBorder,
    columnBorder,
    oddRowBackgroundColor,
    headerBackgroundColor,
    headerTextColor,
    headerColumnBorder,
    headerVerticalPaddingScale,
    headerFontSize,
    headerFontWeight,
  });

  console.log('style', style);

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        theme={theme}
      />
    </div>
  );
};

export default AgGrid;

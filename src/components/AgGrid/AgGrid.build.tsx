import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { IAgGridProps } from './AgGrid.config';
import { ColDef } from 'ag-grid-community';

const AgGrid: FC<IAgGridProps> = ({ columns, style, className, classNames = [] }) => {
  const {
    connectors: { connect },
  } = useEnhancedNode();

  const colDefs: ColDef[] = columns.map((col) => ({ field: col.title }));

  const rowData: any[] = Array.from({ length: 20 }, () => {
    const row: any = {};
    columns.forEach((col) => {
      row[col.title] = col.source;
    });
    return row;
  });

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <AgGridReact rowData={rowData} columnDefs={colDefs} />
    </div>
  );
};

export default AgGrid;

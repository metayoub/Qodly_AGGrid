# Qodly AG Grid Component

## Overview

The Qodly AG Grid component is a powerful and flexible data grid for displaying and manipulating tabular data. It supports various features such as sorting, filtering, row selection, and more.

![dataGrid](public/original.png)

![dataGrid](public/table.png)

## Features

- **Multi-Sorting**: Hold the 'Shift' key and click on column headers to sort by multiple columns.
- **Filtering**: Supports text, number, and date filters.
- **Row Selection**: Single row selection is enabled by default.
- **Customizable**: Various settings to customize the appearance and behavior of the grid.
- **State Saving**: You can save the grid state in a Qodly source, for example, saving it in the database.

## Save State

You can save the state of column visibility, Size and order using `Qodly Source` or `localStorage`:

- **Column Visibility**: Toggle column visibility, and changes will be automatically saved.
- **Column Size**: Change the Size of the column and make it suitable for your screen, the new sizes will be saved.
- **Column Order**: Reorder columns by dragging and dropping them, and the new order will be saved.

## Properties

The Qodly AG Grid component provides various properties to customize its appearance and behavior. Here are some of the key settings:

### General Settings

- **Disabled**: Disable the grid.
- **Class**: Add custom CSS classes.
- **Width**: Set the width of the grid.
- **Height**: Set the height of the grid.
- **Spacing**: Set the spacing between grid elements.
- **Accent Color**: Set the accent color.
- **Background Color**: Set the background color.
- **Text Color**: Set the text color.
- **Font Size**: Set the font size.

### Border Settings

- **Border Color**: Set the border color.
- **Border Radius**: Set the border radius.
- **Row Border**: Enable or disable row borders.
- **Column Border**: Enable or disable column borders.

### Header Settings

- **Header Background Color**: Set the header background color.
- **Header Text Color**: Set the header text color.
- **Header Vertical Padding Scale**: Set the vertical padding scale for headers.
- **Header Column Border**: Enable or disable column borders in the header.
- **Header Font Size**: Set the font size for headers.
- **Header Font Weight**: Set the font weight for headers.

### Cell Settings

- **Odd Row Background Color**: Set the background color for odd rows.
- **Cell Horizontal Padding Scale**: Set the horizontal padding scale for cells.
- **Row Vertical Padding Scale**: Set the vertical padding scale for rows.

### Icon Settings

- **Icon Size**: Set the size of icons.

## Events

The Qodly AG Grid component supports various events to handle user interactions:

- **On Select**: Triggered when a row is selected.
- **On Click**: Triggered when the grid is clicked.
- **On HeaderClick**: Triggered when a column header is clicked.
- **On CellClick**: Triggered when a cell is clicked.
- **On SaveState**: Triggered when the grid state is saved.

## Styling

TODO ...

## License

This project is licensed under the MIT License.

```

```

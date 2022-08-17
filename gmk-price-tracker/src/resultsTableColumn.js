const tableColumns = [
    {
        title: "Category",
        dataIndex: "category",
        sorter: (a, b) => {
            return a.category < b.category ? -1 : 1
        },
        sortDirections: ['ascend', 'descend', 'ascend'],
        filters: [
            {
                text: 'Base',
                value: 'base',
            },
            {
                text: 'Bundle',
                value: 'bundle',
            },
            {
                text: 'Single',
                value: 'single',
            },
            {
                text: 'Other',
                value: 'other',
            },
        ],
        onFilter: (value, record) => value === record.category
    },
    {
        title: "Price (USD)",
        dataIndex: "price",
        sorter: (a, b) => {
            return a.price - b.price
        },
        sortDirections: ['ascend', 'descend', 'ascend']
    },
    {
        title: "Link",
        dataIndex: "link",
        sorter: (a, b) => {
            return a.link < b.link ? -1 : 1
        },
        sortDirections: ['ascend', 'descend', 'ascend'],
        render: (text, record) => {
            return <a href={"https://www.reddit.com" + record.linkFull} target="_blank" rel="noopener noreferrer">{text}</a>
        },
    },
    {
        title: "Date",
        dataIndex: "date",
        sorter: (a, b) => {
            return a.date < b.date ? -1 : 1
        },
        sortDirections: ['ascend', 'descend', 'ascend'],
        defaultSortOrder: "ascend",
        render: (date) => date.toString(),
    },
    {
        title: "Sets",
        dataIndex: "sets",
        sorter: (a, b) => {
            return a.sets < b.sets ? -1 : 1
        },
        sortDirections: ['ascend', 'descend', 'ascend']
    },
];

export default tableColumns;
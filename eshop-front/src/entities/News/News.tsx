import { useEffect, useState } from "react";
import axios from "axios";
import { Flex, Card, Typography, Input, InputNumber, Form, Button, Table, Popconfirm } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Meta from "antd/es/card/Meta";
import { NewsItem, useFetchNews, useCreateNews, useDeleteNews, useUpdateNews } from "./News";
import type { TableProps } from "antd";


interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    inputType: 'number' | 'text';
    record: NewsItem;
    index: number;
  }
  
  const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    const inputNode = inputType === 'number' ? <InputNumber /> : ((dataIndex === 'description' || dataIndex === 'text') ? <Input.TextArea style={{ margin: '1em 0em', minHeight: '7em' }} /> : <Input />);
  
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          <div
            style={{
              maxHeight: '10em',  // Ограничиваем высоту ячейки при просмотре
              overflow: 'auto',    // Включаем прокрутку, если текст выходит за пределы
              whiteSpace: 'pre-wrap', // Разрешаем перенос строк
              wordWrap: 'break-word', // Перенос слов
              wordBreak: 'break-all',
            }}
          >
            {children}
          </div>
        )}
      </td>
    );
  };
  
  export const NewsWidget: React.FC = () => {
    const [form] = Form.useForm();
    const { newsItems } = useFetchNews();
    const { updateExistingNews } = useUpdateNews();
    const { deleteExistingNews } = useDeleteNews();
    const { createNewNews } = useCreateNews(); // Хук для создания нового продукта
    const [data, setData] = useState<NewsItem[]>([]);
    const [editingKey, setEditingKey] = useState<number | null>(null);
    const [newNewsId, setNewNewsId] = useState<number | null>(null);
  
    useEffect(() => {
      setData(newsItems);
    }, [newsItems]);
  
    const isEditing = (record: NewsItem) => record.id === editingKey;
  
    const edit = (record: Partial<NewsItem> & { id: React.Key }) => {
      form.setFieldsValue({ name: '', price: 0, description: '', ...record });
      setEditingKey(record.id);
    };
  
    const cancel = () => {
      if (newNewsId) {
        setData(data.filter(item => item.id !== newNewsId));
        setNewNewsId(null);
      }
      setEditingKey(null);
    };
  
    const save = async (key: React.Key) => {
      try {
        const row = (await form.validateFields()) as NewsItem;
        const newData = [...data];
        const index = newData.findIndex((item) => key === item.id);
  
        if (index > -1) {
          const item = newData[index];
          newData.splice(index, 1, {
            ...item,
            ...row,
          });
          if (key === newNewsId) {
            const newNews = await createNewNews({ ...item, ...row, id: 0 }); // Отправляем новый продукт на сервер
            setNewNewsId(null);
            newData.splice(index, 1, newNews!);
          } else {
            await updateExistingNews(item.id, { ...item, ...row });
          }
          setData(newData);
          setEditingKey(null);
        }
      } catch (errInfo) {
        console.log('Validate Failed:', errInfo);
      }
    };
  
    const deleteItem = async (recordId: number) => {
      await deleteExistingNews(recordId);
      setData(data.filter(News => News.id !== recordId));
    };
  
    const handleAdd = () => {
      const newNews: NewsItem = {
        id: Date.now(), // Временный ID для нового продукта
        title: '',
        description: '',
        text: '',
      };
      setData([...data, newNews]);
      setNewNewsId(newNews.id); // Устанавливаем временный ID
      setEditingKey(newNews.id); // Открываем редактирование для новой строки
    };
  
    const columns = [
      {
        title: 'Title',
        dataIndex: 'title',
        width: '15%',
        editable: true,
      },
      {
        title: 'Description',
        dataIndex: 'description',
        width: '25%',
        editable: true,
      },
      {
        title: 'Text',
        dataIndex: 'text',
        width: '35%',
        editable: true,
      },
      {
        title: 'Operation',
        dataIndex: 'operation',
        render: (_: any, record: NewsItem) => {
          const editable = isEditing(record);
          return editable ? (
            <span>
              <Typography.Link onClick={() => save(record.id)} style={{ marginInlineEnd: 8 }}>
                Save
              </Typography.Link>
              <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                <a>Cancel</a>
              </Popconfirm>
            </span>
          ) : (
            <>
              <Typography.Link disabled={editingKey !== null} onClick={() => edit(record)}>
                Edit
              </Typography.Link>
              <span style={{ margin: '0em 0.5em' }}>|</span>
              <Typography.Link disabled={editingKey !== null} onClick={() => deleteItem(record.id)}>
                Delete
              </Typography.Link>
            </>
          );
        },
      },
    ];
  
    const mergedColumns: TableProps<NewsItem>['columns'] = columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: NewsItem) => ({
          record,
          inputType: 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: isEditing(record),
        }),
      };
    });
  
    return (
      <>
        <Button
          onClick={handleAdd}
          type="primary"
          style={{ marginBottom: 16 }}
        >
          Add News
        </Button>
        <Form form={form} component={false}>
          <Table<NewsItem>
            components={{
              body: { cell: EditableCell },
            }}
            bordered
            dataSource={data}
            columns={mergedColumns}
            rowClassName="editable-row"
            pagination={{ onChange: cancel }}
            rowKey="id"
          />
        </Form>
      </>
    );
  };
  




export const News: React.FC<{ hasButtons?: boolean }> = ({ hasButtons = false}) => {
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]); // Состояние для хранения новостей
    const [loading, setLoading] = useState<boolean>(true); // Состояние для отображения загрузки
    const [error, setError] = useState<string | null>(null); // Состояние для ошибки

    useEffect(() => {
        // Выполняем запрос к API для получения новостей
        axios.get<NewsItem[]>("https://localhost:7078/api/NewsItems")
            .then(response => {
                setNewsItems(response.data); // Сохраняем новости в состояние
                setLoading(false); // Устанавливаем, что загрузка завершена
            })
            .catch(() => {
                setError("Failed to fetch news."); // Обрабатываем ошибку
                setLoading(false); // Завершаем загрузку в случае ошибки
            });
    }, []); // Эффект выполняется один раз при монтировании компонента

    // Если идет загрузка, отображаем индикатор загрузки
    if (loading) {
        return <Flex justify="space-evenly" align="center"><Typography.Title><LoadingOutlined /></Typography.Title></Flex>;
    }

    // Если произошла ошибка, отображаем сообщение об ошибке
    if (error) {
        return <Flex justify="space-evenly" align="center"><Typography.Title>{error}</Typography.Title></Flex>
    }

    // Отображение списка новостей
    return (
        <Flex justify="space-evenly" align="center" wrap>
                {!hasButtons ? newsItems.map((newsItem) => (
                    <Card key={newsItem.id} style={{minWidth: '30%', margin: '1em', maxWidth: '90%'}}>
                        <Meta title={newsItem.title} description={newsItem.description} style={{ margin: '1em 0em'}}/>
                        <Typography.Paragraph>{newsItem.text}</Typography.Paragraph>
                    </Card>
                )) : <></>}
        </Flex>
    );
};
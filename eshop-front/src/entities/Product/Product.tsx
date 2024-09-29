import { Flex, Card, Typography, Button, Collapse, Form, Input, InputNumber, Popconfirm, Table } from "antd";
import { LoadingOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import Meta from "antd/es/card/Meta";
import React, { useEffect, useState } from 'react';
import type { TableProps } from 'antd';
import { Product, useDeleteProduct, useFetchProducts, useUpdateProduct, useCreateProduct } from './Product'; // Импортируем useCreateProduct для добавления нового продукта
import { OrderItemRequest } from "../Order/Order";

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: Product;
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
  const inputNode = inputType === 'number' ? <InputNumber /> : (dataIndex === 'description' ? <Input.TextArea style={{ margin: '1em 0em', minHeight: '7em' }} /> : <Input />);

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
          }}
        >
          {children}
        </div>
      )}
    </td>
  );
};

export const ProductsWidget: React.FC = () => {
  const [form] = Form.useForm();
  const { products } = useFetchProducts();
  const { updateExistingProduct } = useUpdateProduct();
  const { deleteExistingProduct } = useDeleteProduct();
  const { createNewProduct } = useCreateProduct(); // Хук для создания нового продукта
  const [data, setData] = useState<Product[]>([]);
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [newProductId, setNewProductId] = useState<number | null>(null);

  useEffect(() => {
    setData(products);
  }, [products]);

  const isEditing = (record: Product) => record.id === editingKey;

  const edit = (record: Partial<Product> & { id: React.Key }) => {
    form.setFieldsValue({ name: '', price: 0, description: '', ...record });
    setEditingKey(record.id);
  };

  const cancel = () => {
    if (newProductId) {
      setData(data.filter(item => item.id !== newProductId));
      setNewProductId(null);
    }
    setEditingKey(null);
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as Product;
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.id);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        if (key === newProductId) {
          const newProduct = await createNewProduct({ ...item, ...row, id: 0 }); // Отправляем новый продукт на сервер
          setNewProductId(null);
          newData.splice(index, 1, newProduct!);
        } else {
          await updateExistingProduct(item.id, { ...item, ...row });
        }
        setData(newData);
        setEditingKey(null);
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const deleteItem = async (recordId: number) => {
    await deleteExistingProduct(recordId);
    setData(data.filter(product => product.id !== recordId));
  };

  const handleAdd = () => {
    const newProduct: Product = {
      id: Date.now(), // Временный ID для нового продукта
      name: '',
      description: '',
      brand: '',
      price: 0,
    };
    setData([...data, newProduct]);
    setNewProductId(newProduct.id); // Устанавливаем временный ID
    setEditingKey(newProduct.id); // Открываем редактирование для новой строки
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: '25%',
      editable: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: '35%',
      editable: true,
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      width: '15%',
      editable: true,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      width: '15%',
      editable: true,
      render: (price: number) => `$${price}`, // Отображаем цену с символом $
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      render: (_: any, record: Product) => {
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

  const mergedColumns: TableProps<Product>['columns'] = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Product) => ({
        record,
        inputType: col.dataIndex === 'price' ? 'number' : 'text',
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
        Add Product
      </Button>
      <Form form={form} component={false}>
        <Table<Product>
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




export const Products: React.FC<{addToCart: (item: OrderItemRequest) => void}> = ({ addToCart }) => {
    const { products, loading, error } = useFetchProducts();

    

    // Если идет загрузка, отображаем индикатор загрузки
    if (loading) {
        return <Flex justify="space-evenly" align="center"><Typography.Title><LoadingOutlined /></Typography.Title></Flex>;
    }

    // Если произошла ошибка, отображаем сообщение об ошибке
    if (error) {
        return <Flex justify="space-evenly" align="center"><Typography.Title>{error}</Typography.Title></Flex>
    }

    return (
        <Flex wrap gap="small">
                {products.map((product) => (
                    <Card key={product.id} style={{minWidth: '20em', margin: '1em 0em', maxWidth: '100%', height: '100%', flex: '1 1 calc(30% - 1em)'}}>
                        <Meta title={product.name} description={product.brand} style={{margin: '1em'}}/>
                        <div style={{margin: '1em'}}>
                        <Collapse items={[{
                            key: '1',
                            label: 'Description:',
                            children: <Typography.Paragraph style={{overflow: 'auto'}}>{product.description}</Typography.Paragraph>
                        }]}/>
                        <Typography.Paragraph style={{margin: '1em 0em'}}>Price: ${product.price}</Typography.Paragraph>
                        <Button onClick={() => addToCart({ product, quantity: 1})}><ShoppingCartOutlined /></Button>
                        </div>
                    </Card>
                ))}
        </Flex>
    );
};
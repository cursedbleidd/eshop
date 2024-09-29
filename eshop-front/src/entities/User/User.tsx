import {useFetchUsers, useDeleteUser, User} from './User.ts';
import { Order, OrderItem, useDeleteOrder, useUpdateOrder } from '../Order/Order.ts';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { Table, Typography, Badge, Space, Dropdown, Flex} from 'antd';
import { LoadingOutlined, DownOutlined } from '@ant-design/icons';

export const UserWidget: React.FC<{ showUsers?: boolean}> = ({ showUsers = false}) => {
  const { users, loading, error } = useFetchUsers();
  const { deleteExistingUser } = useDeleteUser();
  const { deleteExistingOrder } = useDeleteOrder();
  const { updateOrder } = useUpdateOrder();
  const [localUsers, setLocalUsers] = useState<User[]>([]);

  useEffect(() => {
    if (users.length > 0) {
      setLocalUsers(users);
    }
  }, [users]);

  const handleDeleteUser = async (id: number) => {
    try {
        await deleteExistingUser(id);
        setLocalUsers(prevUsers => prevUsers.filter(e => e.id !== id));
    } catch (error) {
        console.error('Failed to change order status:', error);
  };
}
  const handleDeleteOrder = async (orderId: number) => {
    try {
      await deleteExistingOrder(orderId);
      setLocalUsers(prevUsers =>
        prevUsers.map(user => ({
          ...user,
          orders: user.orders.filter(order => order.id !== orderId),
        }))
      );
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const handleChangeOrderStatus = async (order: Order) => {
    try {
      const newStatus = prompt('Enter new status for the order:');
      if (!newStatus) return;

      await updateOrder(order.id, {...order, status: newStatus});
      setLocalUsers(prevUsers =>
        prevUsers.map(user => ({
          ...user,
          orders: user.orders.map(norder =>
            norder.id === order.id ? { ...norder, status: newStatus } : norder
          ),
        }))
      );
    } catch (error) {
      console.error('Failed to change order status:', error);
    }
  };

  const expandedRowRender = (user: User) => (
    <Table<Order>
      columns={orderColumns}
      dataSource={user.orders.map(order => ({ ...order, key: order.id }))}
      pagination={false}
      rowKey="id"
      expandable={{
        expandedRowRender: (order: Order) => (
          <Table<OrderItem>
            columns={orderItemColumns}
            dataSource={order.orderItems.map(item => ({ ...item, key: item.id }))}
            pagination={false}
            rowKey="id"
          />
        ),
      }}
    />
  );

  const userColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Account Type', dataIndex: 'accType', key: 'accType', render: (accType: number) => (accType === 1 ? "User" : "Admin") },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, user: User) => <a onClick={() => handleDeleteUser(user.id)}>Delete</a>,
    }, 
  ];

  const orderColumns = [
    { title: 'Destination', dataIndex: 'destination', key: 'destination', width: '30%' },
    { title: 'Status', dataIndex: 'status', key: 'status', width: '10%' },
    { title: 'Receiver', dataIndex: 'surnameRec', key: 'surnameRec', width: '30%' },
    { title: 'Name', dataIndex: 'nameRec', key: 'nameRec', width: '10%' },
    {
      title: 'Action',
      key: 'action',
      width: '20%',
      render: (_: any, order: Order) => (
        <>
          <a onClick={() => handleDeleteOrder(order.id)}>Delete</a>
          <span style={{ margin: '0 8px' }}>|</span>
          <a onClick={() => handleChangeOrderStatus(order)}>Change Status</a>
        </>
      ),
    },
  ];

  const orderItemColumns = [
    { title: 'Product Name', dataIndex: ['product', 'name'], key: 'productName' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Price', dataIndex: ['product', 'price'], key: 'price' },
  ];


  if (loading) {
    return (
      <Flex justify="center" align="center">
        <Typography.Title><LoadingOutlined /></Typography.Title>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" align="center">
        <Typography.Title>Error: {error}</Typography.Title>
      </Flex>
    );
  }

  return (
    showUsers ? <Table<User>
      columns={userColumns}
      expandable={{ expandedRowRender }}
      dataSource={localUsers.map(user => ({ ...user, key: user.id }))}
      rowKey="id"
    />
    :
    <Table<Order>
      columns={orderColumns}
      dataSource={localUsers.flatMap(user => user.orders.map(order => ({ ...order, key: order.id })))}
      pagination={false}
      rowKey="id"
      expandable={{
        expandedRowRender: (order: Order) => (
          <Table<OrderItem>
            columns={orderItemColumns}
            dataSource={order.orderItems.map(item => ({ ...item, key: item.id }))}
            pagination={false}
            rowKey="id"
          />
        ),
      }}
    />
  );
};

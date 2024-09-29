import { OrderRequest, OrderItemRequest, useCreateOrder, useFetchOrders } from "./Order";
import { Flex, Card, Typography, Table, Collapse, Button, Input } from "antd";
import { LoadingOutlined, PlusOutlined, MinusOutlined, DeleteOutlined } from "@ant-design/icons";
import Meta from "antd/es/card/Meta";
import { useState } from "react";

export const CartWidget: React.FC<{
    cart: OrderItemRequest[];
    increaseQuantity: (productId: number) => void;
    decreaseQuantity: (productId: number) => void;
    removeFromCart: (productId: number) => void;
    cleanCart: () => void;
}> = ({ cart, increaseQuantity, decreaseQuantity, removeFromCart, cleanCart }) => {
    const [dest, setDest] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    //const [errorN, setErrorN] = useState<string | null>(null)
    const { createNewOrder, loading, error } = useCreateOrder();
    const createOrder = async () =>
    {
        if (cart.length === 0) {
            alert("Fill your cart with items");
            return;
        }
        const req: OrderRequest = {
            destination: dest,
            nameRec: name,
            surnameRec: surname,
            orderItems: cart
        }
        if (await createNewOrder(req))
            cleanCart();
    }
    const handleNames = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        //if (/^[a-zA-Z]*$/.test(value)) { // Проверяем только английские буквы
            if (e.target.id === 'name')
                setName(value)
            else if (e.target.id === 'surname')
                setSurname(value);
            //setErrorN(null);
        //}
        //else {
        //    setErrorN('Must contain only English letters');
        //}
    }
    return (
        <>
        <Table dataSource={cart.map((item) => (
            {
                key: item.product.id,
                name: item.product.name,
                brand: item.product.brand,
                price: `$${item.product.price}`,
                quantity: item.quantity
            }
        ))}
        columns={[
            {
                key: 'name',
                dataIndex: 'name',
                title: 'Name'
            },
            {
                key: 'brand',
                dataIndex: 'brand',
                title: 'Brand'
            },
            {
                key: 'price',
                dataIndex: 'price',
                title: 'Price'
            },
            {
                key: 'quantity',
                dataIndex: 'quantity',
                title: 'Quantity',
                render: (quantity, record) => (
                    <div>
                        <Button onClick={() => decreaseQuantity(record.key)} icon={<MinusOutlined />} />
                        <span style={{ margin: '0em 1em' }}>{quantity}</span>
                        <Button onClick={() => increaseQuantity(record.key)} icon={<PlusOutlined />} />
                    </div>
                )
            },
            {
                title: 'Actions',
                key: 'actions',
                render: (_, record) => (
                    <Button danger onClick={() => removeFromCart(record.key)} icon={<DeleteOutlined />} />
                ),
            },
        ]}
        pagination={false}
        style={{overflow: 'auto'}}/>
        <>
        <Input id="dest" onChange={(v) => setDest(v.target.value)} style={{margin: '1em 0em'}} placeholder="Destination"/>
        <Input id="name" onChange={handleNames} style={{margin: '1em 0em'}} placeholder="Receiver's name"/>
        <Input id="surname" onChange={handleNames} style={{margin: '1em 0em'}} placeholder="Receiver's surname"/>
        {/* { errorN ? <Typography.Title level={5}>{errorN}</Typography.Title> : <></> } */}
        <Button loading={loading} onClick={createOrder} type="primary">Place the order</Button>
        {error ? <Typography.Title level={5}>{error}</Typography.Title> : <></>}
        </>
        </>
    )
}


export const Cart: React.FC<{
    cart: OrderItemRequest[]
}> = ({ cart }) => {

    return (
        <>
        <Table dataSource={cart.map((item) => (
            {
                key: item.product.id,
                name: item.product.name,
                brand: item.product.brand,
                price: `$${item.product.price}`,
                quantity: item.quantity
            }
        ))}
        columns={ [
            {
                key: 'name',
                dataIndex: 'name',
                title: 'Name'
            },
            {
                key: 'brand',
                dataIndex: 'brand',
                title: 'Brand'
            },
            {
                key: 'price',
                dataIndex: 'price',
                title: 'Price'
            },
            {
                key: 'quantity',
                dataIndex: 'quantity',
                title: 'Quantity',
            },
        ] }
        pagination={false}
        style={{overflow: 'auto'}}/>
        </>
    )
}


export const Orders: React.FC<{ hasButtons?: boolean }> = ({ hasButtons = false}) => {
    const {orders, loading, error} = useFetchOrders();

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
        <Flex justify="space-evenly" vertical
        style={{
            overflow: 'auto',
            
        }}>
                {!hasButtons ? orders.map((order) => (
                    <Card key={order.id} style={{margin: '1em 0em'}}>
                        <Meta title={`Status: ${order.status}`} description={`Addres: ${order.destination} Receiver: ${order.nameRec}, ${order.surnameRec}`} style={{margin: '1em 0em'}}/>
                        <Collapse items={[{
                            key: '1',
                            label: 'Cart',
                            children: <Cart cart={order.orderItems} />}]}/>
                        <Typography.Title level={4} style={{margin: '1em 0em'}}>Cost: ${order.orderItems.reduce((sum, a) => sum + a.product.price * a.quantity, 0)}</Typography.Title>
                    </Card>
                )) : <></>}
        </Flex>
    );
};


  
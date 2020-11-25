/*
 * @Author: shijunwen
 * @Email: shijunwen@njsdata.com
 * @LastEditors: shijunwen
 * @Date: 2020-11-12 14:08:27
 * @LastEditTime: 2020-11-25 13:04:37
 * @Description: 请描述文件作用
 */
import { useState, useRef } from "react";
import DraggableBlock from "./DraggableBlock";
import DraggableContainer from "./DraggableContainer";
import { Rnd } from "react-rnd";
import "./App.css";

const App = () => {
  const [dataSource, setDataSource] = useState([
    {
      id: "1",
      width: 200,
      height: 20,
      x: 248,
      y: 343,
      zIndex: 0,
      content: "第一个元素",
    },
    {
      id: "2",
      width: 100,
      height: 30,
      x: 300,
      y: 234,
      zIndex: 0,
      content: "第二个元素",
      enableResizing: false,
      disableDragging: true,
    },
    {
      id: "3",
      width: 100,
      height: 30,
      x: 305,
      y: 60,
      zIndex: 0,
      content: "第三个元素",
    },
    {
      id: "4",
      width: 100,
      height: 30,
      x: 303,
      y: 134,
      zIndex: 0,
      content: "第四个元素",
    },
  ]);
  const rndBlocks = useRef({});
  const reLoadData = () => {
    setDataSource([...dataSource]);
  };

  const [height, setHeight] = useState(600);

  const renderData = (value) => <div>{value.content}</div>;
  const onDragStart = (index) => {};

  const onDragEnd = () => {};

  const onResizeStop = (e, value) => {
    const minHeight = 50;
    const changeHeight = Number(value.replace("px", ""));

    setHeight(changeHeight < minHeight ? minHeight : changeHeight);
  };
  return (
    <div>
      <DraggableContainer
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className="draggableBlock"
        style={{ margin: "auto", height: height, zIndex: 2 }}
        bounds=".draggableBlock"
        dataSource={dataSource}
      >
        {dataSource.map((data) => (
          <DraggableBlock
            key={data.id}
            data={data}
            reLoad={reLoadData}
            renderData={renderData}
          />
        ))}
      </DraggableContainer>
      <Rnd
        style={{ margin: "auto", right: 0, zIndex: 1 }}
        enableResizing={{
          top: false,
          right: false,
          bottom: true,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
        minHeight={50}
        size={{ height: height + 5 }}
        disableDragging
        onResizeStop={(e, direction, ref, delta, position) => {
          onResizeStop(ref.style.width, ref.style.height, position);
        }}
      />
    </div>
  );
};

export default App;

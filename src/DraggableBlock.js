/*
 * @Author: shijunwen
 * @Email: shijunwen@njsdata.com
 * @LastEditors: shijunwen
 * @Date: 2020-11-13 09:33:05
 * @LastEditTime: 2020-11-25 12:50:22
 * @Description: 拖拽放大
 */
import React, { useRef } from "react";
import PropTypes from "prop-types";
import { Rnd } from "react-rnd";

const style = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "solid 1px #ddd",
  background: "#f0f0f0",
};
const DraggableBlock = ({
  data,
  reLoad,
  _dragStart,
  _drag,
  _stop,
  _onResize,
  maxZindex,
  onRef,
  bounds,
  renderData,
  disableDragging,
  enableResizing,
}) => {
  const rndBlock = useRef(null);
  const startPosition = useRef({ startX: "", startY: "" });
  // useEffect(() => {
  //   onRef(rndBlock.current);
  // }, [onRef]);
  /**
   * @description: 开始拖拽
   * @param {*}
   * @return {*}
   */
  const onDragStart = (node, position) => {
    startPosition.current.startX = position.x;
    startPosition.current.startY = position.y;

    _dragStart();
  };
  /**
   * @description: 拖拽中
   * @param { HTMLElement} node
   * @param { 
    x: number,
    y: number,
    deltaX: number,
    deltaY: number,
    lastX: number, lastY: number
    } position
   * @return {*}
   */
  const onDrag = (node, position) => {
    const { x: dragX, y: dragY } = position;
    const { x, y } = _drag(dragX, dragY);
    data.x = x;
    data.y = y;
    reLoad();
  };
  /**
   * @description: 
   * @param {HTMLElement} 
   * @param {
    x: number,
    y: number,
    deltaX: number, deltaY: number,
    lastX: number, lastY: number
    }
   * @return {*}
   */
  const onDragStop = (x, y) => {
    const { startX, startY } = startPosition.current;
    const isAction = data.x !== startX || data.y !== startY;

    reLoad(isAction);
    _stop();
  };
  /**
   * @description:开始
   * @param {元素宽度} width
   * @param {元素高度} height
   * @param {元素位置信息} position
   * @return {*}
   */
  const onResizeStart = (width, height, position) => {
    _dragStart();
  };
  /**
   * @description:
   * @param {元素宽度} width
   * @param {元素高度} height
   * @param {元素位置信息} position
   * @return {*}
   */
  const onResize = (width, height, position) => {
    data.width = Number(width.replace("px", ""));
    data.height = Number(height.replace("px", ""));
    data.x = position.x;
    data.y = position.y;
    const { x: lastX, y: lastY } = _onResize(
      data.width,
      data.height,
      position.x,
      position.y
    );
    data.x = lastX;
    data.y = lastY;
    reLoad();
  };
  /**
   * @description:
   * @param {元素宽度} width
   * @param {元素高度} height
   * @param {元素位置信息} position
   * @return {*}
   */
  const onResizeStop = (width, height, position) => {
    data.width = Number(width.replace("px", ""));
    data.height = Number(height.replace("px", ""));
    data.x = position.x;
    data.y = position.y;
    _stop();
    reLoad(true);
  };
  return (
    <Rnd
      disableDragging={disableDragging}
      ref={rndBlock}
      minWidth={30}
      minHeight={20}
      enableResizing={enableResizing}
      key={data.id}
      bounds={bounds || ".canvasContent"}
      style={{ ...style }}
      size={{ width: data.width, height: data.height }}
      position={{ x: data.x, y: data.y }}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragStop={(e, d) => {
        onDragStop(d.x, d.y);
      }}
      onResizeStart={(e, direction, ref, delta, position) => {
        onResizeStart(ref.style.width, ref.style.height, position);
      }}
      onResize={(e, direction, ref, delta, position) => {
        onResize(ref.style.width, ref.style.height, position);
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        onResizeStop(ref.style.width, ref.style.height, position);
      }}
    >
      {renderData(data)}
    </Rnd>
  );
};
DraggableBlock.propTypes = {
  data: PropTypes.array,
  reLoad: PropTypes.func,
  _dragStart: PropTypes.func,
  _drag: PropTypes.func,
  _stop: PropTypes.func,
  _onResize: PropTypes.func,
  maxZindex: PropTypes.func,
  bounds: PropTypes.string,
  onRef: PropTypes.object,
  renderData: PropTypes.func,
  disableDragging: PropTypes.bool,
  enableResizing: PropTypes.object,
};
export default DraggableBlock;

/*
 * @Author: shijunwen
 * @Email: shijunwen@njsdata.com
 * @LastEditors: shijunwen
 * @Date: 2020-11-16 10:30:36
 * @LastEditTime: 2020-11-23 19:11:00
 * @Description: 处理拖拽放大生成辅助线跟吸附
 */
import React from 'react';
import PropTypes from 'prop-types';
import { unique, checkArrayWithPush, getMaxDistance } from './utils';

export default class DraggableContainer extends React.Component {
  // container HTMLElement
  $ = null;
  // children HTMLElement
  _children = [];
  // 最大z-index
  _maxZindex = 0;
  static propTypes = {
    onDragEnd: PropTypes.func,
    onDragStart: PropTypes.func,
    Container: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    style: PropTypes.object,
    directions: PropTypes.array,
    threshold: PropTypes.number,
    className: PropTypes.string,
    activeClassName: PropTypes.string,
    lineStyle: PropTypes.object,
    dataSource: PropTypes.array,
    children: PropTypes.array,
    bounds: PropTypes.string,
    id: PropTypes.string,
  };

  static defaultProps = {
    Container: 'div',
    style: {},
    directions: ['tt', 'bb', 'll', 'rr', 'tb', 'lr'],
    threshold: 3,
    className: '',
    activeClassName: 'active',
    lineStyle: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      indices: [],
      vLines: [],
      hLines: [],
    };
  }

  // 拖拽初始时 计算出所有元素的坐标信息，存储于this.$children
  initialize = index => {
    return () => {
      const { dataSource = [], onDragStart } = this.props;
      this._children = dataSource.map((child, i) => {
        const x = child.x;
        const y = child.y;
        const w = child.width;
        const h = child.height;
        this._maxZindex =
          child.zIndex > this._maxZindex ? child.zIndex : this._maxZindex;
        return {
          $: child,
          i,
          x,
          y,
          w,
          h,
          l: x,
          r: x + w,
          t: y,
          b: y + h,
          lr: x + w / 2,
          tb: y + h / 2,
        };
      });
      if (typeof onDragStart === 'function') {
        onDragStart(index);
      }
    };
  };

  /**
   * @description: 清除辅助线
   * @param {*}
   * @return {*}
   */
  reset = () => {
    this.setState({ vLines: [], hLines: [], indices: [] });
    const { onDragEnd } = this.props;
    if (typeof onDragEnd === 'function') {
      onDragEnd();
    }
  };

  // 拖动中计算是否吸附/显示辅助线
  calc = index => {
    return (x, y) => {
      const target = this._children[index];
      const compares = this._children.filter((_, i) => i !== index);

      if (compares.length === 0) {
        return { x, y };
      }
      return this.calcAndDrawLines({ x, y }, target, compares);
    };
  };
  /**
   * @description: 元素放大缩小
   * @param {*} index
   * @return {*}
   */
  calcResize = index => {
    return (width, height, x, y) => {
      const w = width;
      const h = height;
      const compares = this._children.filter((_, i) => i !== index);

      if (compares.length === 0) {
        return { width, height };
      }
      this._children[index] = {
        ...this._children[index],
        x,
        y,
        w,
        h,
        l: x,
        r: x + w,
        t: y,
        b: y + h,
        lr: x + w / 2,
        tb: y + h / 2,
      };
      return this.calcAndDrawLines({ x, y }, this._children[index], compares);
    };
  };

  /**
   * @param {Object} values xy坐标
   * @param {Object} target 拖拽目标
   * @param {Array} compares 对照组
   */
  calcAndDrawLines(values, target, compares) {
    const { v: x, indices: indices_x, lines: vLines } = this.calcPosValues(
      values,
      target,
      compares,
      'x'
    );
    const { v: y, indices: indices_y, lines: hLines } = this.calcPosValues(
      values,
      target,
      compares,
      'y'
    );

    const indices = unique(indices_x.concat(indices_y));

    if (vLines.length && hLines.length) {
      vLines.forEach(line => {
        const compare = compares.find(({ i }) => i === line.i);
        const { length, origin } = this.calcLineValues(
          { x, y },
          target,
          compare,
          'x'
        );

        line.length = length;
        line.origin = origin;
      });

      hLines.forEach(line => {
        const compare = compares.find(({ i }) => i === line.i);
        const { length, origin } = this.calcLineValues(
          { x, y },
          target,
          compare,
          'y'
        );

        line.length = length;
        line.origin = origin;
      });
    }

    this.setState({
      vLines,
      hLines,
      indices,
    });

    return { x, y };
  }

  calcLineValues(values, target, compare, key) {
    const { x, y } = values;
    const { h: H, w: W } = target;
    const { l, r, t, b } = compare;
    const T = y;
    const B = y + H;
    const L = x;
    const R = x + W;

    const direValues = {
      x: [t, b, T, B],
      y: [l, r, L, R],
    };

    const length = getMaxDistance(direValues[key]);
    const origin = Math.min(...direValues[key]);
    return { length, origin };
  }

  calcPosValues(values, target, compares, key) {
    const results = {};

    const directions = {
      x: ['ll', 'rr', 'lr'],
      y: ['tt', 'bb', 'tb'],
    };

    // filter unnecessary directions
    const validDirections = directions[key].filter(dire =>
      this.props.directions.includes(dire)
    );

    compares.forEach(compare => {
      validDirections.forEach(dire => {
        const { near, dist, value, origin, length } = this.calcPosValuesSingle(
          values,
          dire,
          target,
          compare,
          key
        );
        if (near) {
          checkArrayWithPush(results, dist, {
            i: compare.i,
            $: compare._child,
            value,
            origin,
            length,
          });
        }
      });
    });

    const resultArray = Object.entries(results);
    if (resultArray.length) {
      const [minDistance, activeCompares] = resultArray.sort(
        ([dist1], [dist2]) => Math.abs(dist1) - Math.abs(dist2)
      )[0];
      const dist = parseInt(minDistance);
      return {
        v: values[key] - dist,
        dist: dist,
        lines: activeCompares,
        indices: activeCompares.map(({ i }) => i),
      };
    }
    return {
      v: values[key],
      dist: 0,
      lines: [],
      indices: [],
    };
  }

  calcPosValuesSingle(values, dire, target, compare, key) {
    const { x, y } = values;
    const W = target.w;
    const H = target.h;
    const { l, r, t, b, lr, tb } = compare;
    const { origin, length } = this.calcLineValues(
      { x, y },
      target,
      compare,
      key
    );

    const result = {
      // 距离是否达到吸附阈值
      near: false,
      // 距离差
      dist: Number.MAX_SAFE_INTEGER,
      // 辅助线坐标
      value: 0,
      // 辅助线长度
      length,
      // 辅助线起始坐标（对应绝对定位的top/left）
      origin,
    };

    // eslint-disable-next-line default-case
    switch (dire) {
      case 'lr':
        result.dist = x + W / 2 - lr;
        result.value = lr;
        break;
      case 'll':
        result.dist = x - l;
        result.value = l;
        break;
      case 'rr':
        result.dist = x + W - r;
        result.value = r;
        break;
      case 'tt':
        result.dist = y - t;
        result.value = t;
        break;
      case 'bb':
        result.dist = y + H - b;
        result.value = b;
        break;
      case 'tb':
        result.dist = y + H / 2 - tb;
        result.value = tb;
        break;
    }

    if (Math.abs(result.dist) < this.props.threshold + 1) {
      result.near = true;
    }

    return result;
  }

  _renderGuideLine() {
    const { vLines, hLines } = this.state;
    const { lineStyle } = this.props;
    const commonStyle = {
      position: 'absolute',
      zIndex: Number.MAX_SAFE_INTEGER,
      backgroundColor: '#FF00CC',
      ...lineStyle,
    };

    // support react 15
    const Container = React.Fragment || 'div';
    return (
      <Container>
        {vLines.map(({ length, value, origin }, i) => (
          <span
            className="v-line"
            key={`v-${i}`}
            style={{
              left: value,
              top: origin,
              height: length,
              width: 1,
              ...commonStyle,
            }}
          />
        ))}
        {hLines.map(({ length, value, origin }, i) => (
          <span
            className="h-line"
            key={`h-${i}`}
            style={{
              top: value,
              left: origin,
              width: length,
              height: 1,
              ...commonStyle,
            }}
          />
        ))}
      </Container>
    );
  }
  /**
   * @description: 渲染子组件并传入方法
   * @param {*}
   * @return {*}
   */
  _renderChildren() {
    const { activeClassName, children, bounds } = this.props;
    const { indices } = this.state;

    if (Array.isArray(children)) {
      return (
        <React.Fragment>
          {children.map((child, index) =>
            React.cloneElement(child, {
              _dragStart: this.initialize(index),
              _drag: this.calc(index),
              _stop: this.reset,
              _onResize: this.calcResize(index),
              active: indices.includes(index),
              activeClassName,
              maxZindex: this._maxZindex,
              bounds: bounds,
            })
          )}
        </React.Fragment>
      );
    }

    return children;
  }

  render() {
    const { Container, style, className, id } = this.props;

    return (
      <Container
        id={id}
        className={className}
        style={style}
        ref={ref => (this.$ = ref)}
      >
        {this._renderChildren()}
        {this._renderGuideLine()}
      </Container>
    );
  }
}

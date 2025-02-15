import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Line, Rect, G, Text as SvgText } from 'react-native-svg';
import PropTypes from 'prop-types';

const PointsGraph = ({ data }) => {
  // Validate that data is an array with 7 numbers
  if (!Array.isArray(data) || data.length !== 7 || !data.every(num => typeof num === 'number')) {
    data=[0,0,0,0,0,0,0]
  }

  const chartHeight = 130;
  const chartWidth = 300;
  const barWidth = 34;
  const barMargin = 10;
  const totalPercentage = 100;
  const maxAchievable = 70
  return (
    <View style={{ padding: 20, paddingTop: 0, backgroundColor: '#34495e', borderRadius: 10 }}>
      <Svg height={chartHeight + 50} width={chartWidth}>
        {data.map((value, index) => {
          if (value >= 70){
            value = 70
          }
          const barHeight = (value / totalPercentage) * chartHeight;  // Adjust bar height based on total achievable
          const x = index * (barWidth + barMargin);
          const y = chartHeight - barHeight;

          return (
            <G key={index}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#6fbf73"
                rx="5"
                ry="5"
              />
              <Circle
                cx={x + barWidth / 2}
                cy={y}
                r="10"
                fill="#fff"
                stroke="#6fbf73"
                strokeWidth="2"
              />
              <SvgText
                x={x + barWidth / 2}
                y={y - 15}
                fontSize="12"
                fill="white"
                fontWeight="bold"
                textAnchor="middle"
              >
                {value}
              </SvgText>
            </G>
          );
        })}
        <Line
          x1="0"
          y1={chartHeight}
          x2={chartWidth}
          y2={chartHeight}
          stroke="#fff"
          strokeWidth="2"
        />
        {data.map((_, index) => {
          const x = index * (barWidth + barMargin) + barWidth / 2;
          return (
            <SvgText
              key={index}
              x={x}
              y={chartHeight + 20}
              fontSize="12"
              fill="white"
              fontWeight="bold"
              textAnchor="middle"
            >
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

PointsGraph.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default PointsGraph;

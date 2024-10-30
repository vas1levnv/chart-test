import React, { useState } from 'react';
import ReactEcharts from 'echarts-for-react';
import * as echarts from 'echarts';

interface Node {
  x: number;
  y: number;
  name: string;
}

type SkillData = {
  name: string;
  mainSkills: string[];
  otherSkills: string[];
};

const data: SkillData[] = [
  {
    name: "Финансовый аналитик",
    mainSkills: ["Excel", "SQL", "VBA", "1С"],
    otherSkills: ["Power BI", "Python"],
  },
  {
    name: "Предприниматель",
    mainSkills: ["1C", "Excel", "Power BI"],
    otherSkills: [
      "Google Analytics",
      "Яндекс.Метрика",
      "Python",
      "SQL",
      "Tilda",
    ],
  },
  {
    name: "Продуктовый дизайнер",
    mainSkills: [
      "Figma",
      "Sketch",
      "Illustrator",
      "Photoshop",
      "Principle",
      "Tilda",
    ],
    otherSkills: ["Shopify", "Protopie", "Cinema 4D"],
  },
  {
    name: "Менеджер проекта",
    mainSkills: [
      "Visio",
      "1C",
      "Google Analytics",
      "Яндекс.Метрика",
      "Python",
      "SQL",
      "Tilda",
    ],
    otherSkills: ["Figma", "Sketch", "Shopify"],
  },
  {
    name: "Финансовый менеджер",
    mainSkills: ["1C", "Excel", "Power BI"],
    otherSkills: ["BPMN"],
  },
  {
    name: "Руководитель финансового департамента компании",
    mainSkills: ["Sketch", "Figma"],
    otherSkills: ["Shopify", "HQL"],
  },

  {
    name: "Продуктовый аналитик",
    mainSkills: [
      "Google Analytics",
      "Яндекс.Метрика",
      "SQL",
      "Power BI",
      "Python",
      "Excel",
    ],
    otherSkills: ["HQL", "Tableau", "R", "Machine learning"],
  },

  {
    name: "Руководитель финансового продукта",
    mainSkills: ["Visio"],
    otherSkills: ["Python"],
  },
  {
    name: "Менеджер по маркетингу",
    mainSkills: [
      "Google Analytics",
      "Яндекс.Метрика",
      "Google Ads",
      "Ahrefs",
      "Главред",
      "My Target",
    ],
    otherSkills: ["Tilda", "Photoshop", "Xenu", "Python"],
  },

  {
    name: "Менеджер по цифровой трансформации",
    mainSkills: [
      "Visio",
      "Google Analytics",
      "Яндекс.Метрика",
      "Python",
      "SQL",
      "Tilda",
    ],
    otherSkills: ["Figma", "Sketch", "Shopify"],
  },
]

function getUniqueSkills(data: SkillData[]): string[] {
  const allSkills = data.flatMap(item => [...item.mainSkills, ...item.otherSkills]);
  return Array.from(new Set(allSkills));
}

const innerNodes = data.map(el => el.name);
const outerNodes = getUniqueSkills(data);


const GraphChart: React.FC = () => {
  const [dynamicEdges, setDynamicEdges] = useState<any[]>([]);

  const createCircularData = (nodeArray: any, radius: number, centerX: number, centerY: number, isInner: boolean): Node[] => {
    return Array.from({ length: nodeArray.length }, (_, i) => {
      const angle = (2 * Math.PI * i) / nodeArray.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const itemStyle:any ={};
      if(isInner){
        itemStyle.color = 'gray';
      }
      return { x, y, itemStyle, name: `${nodeArray[i]}` };
    });
  };

  const createEdges = (offset: number, count: number, isInner: boolean) => {
    return Array.from({ length: count }, (_, i) => ({
      source: i + offset,
      target: ((i + 1) % count) + offset,
      lineStyle: {
        curveness: isInner ? 0.1 : 0.05,
        color: 'gray'
      },
    }));
  };

  const mainCircleData = createCircularData(innerNodes, 75, 200, 200, true);
  const outerCircleData = createCircularData(outerNodes, 150, 200, 200, false);

  const edges = [
    ...createEdges(0, mainCircleData.length, true),
    ...createEdges(mainCircleData.length, outerCircleData.length, false),
  ];

  const findClosestNodes = (node: Node, targetNodes: Node[], isInnerNode:boolean) => {
    let currentNodes:any = [];
    if (isInnerNode){
      currentNodes = data
        .filter(el => el.name === node.name)
        .flatMap(el => [...el.mainSkills, ...el.otherSkills]);
    } else{
      currentNodes = data
      .filter(item => 
        item.mainSkills.includes(node?.name) || item.otherSkills.includes(node?.name)
      )
      .map(item => item.name);
    }

    return targetNodes
      .map((item, index) => (currentNodes.includes(item.name) ? index : -1))
      .filter(index => index !== -1);
    };


  const handleNodeClick = (params: any) => {
    const clickedIndex = params.dataIndex;
    const isInnerNode = clickedIndex < mainCircleData.length;
    const targetNodes = isInnerNode ? outerCircleData : mainCircleData;
    const clickedNode = isInnerNode ? mainCircleData[clickedIndex] : outerCircleData[clickedIndex - mainCircleData.length];

    const closestIndices = findClosestNodes(clickedNode, targetNodes, isInnerNode);

    const newEdges = closestIndices.map((index) => ({
      source: clickedIndex,
      target: isInnerNode ? index + mainCircleData.length : index,

      lineStyle: {
        curveness: 0,
      },
    }));

    setDynamicEdges(newEdges);
  };

  const getOption = (): echarts.EChartsOption => ({
    series: [
      {
        type: 'graph',
        layout: 'none',
        data: [...mainCircleData, ...outerCircleData],
        edges: [...edges, ...dynamicEdges],
        symbolSize: 30,
        lineStyle: {
          color: 'gray',
          width: 3,
        },
        itemStyle: {
          color: 'orange',
        },
        label:{
          show: true,
          position: 'top',
        },
        select:{
          itemStyle: {
            color: 'red',
          },
        }
      },
    ],
  });

  return (
    <ReactEcharts
      option={getOption()}
      style={{ height: '100vh', width: '100%' }}
      onEvents={{ click: handleNodeClick }}
    />
  );
};

export default GraphChart;


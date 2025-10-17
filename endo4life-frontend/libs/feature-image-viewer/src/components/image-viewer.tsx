import {
  AnnotationType,
  IAnnotationEntity,
  IBBoxAnnotationEntity,
  ICircleAnnotationEntity,
  IEllipseAnnotationEntity,
  IImageEntity,
  ILineAnnotationEntity,
  IPolygonAnnotationEntity,
  IPolylineAnnotationEntity,
  ITextAnnotationEntity,
} from '../types';

interface Props {
  image?: IImageEntity;
  annotations?: IAnnotationEntity[];
}

export function ImageViewer({ image, annotations }: Props) {
  return (
    <svg
      width="100%"
      viewBox={`0 0 ${image?.width} ${image?.height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {image && <SVGImage image={image} />}
      {annotations?.map((item) => {
        if (item.type === AnnotationType.BBOX) {
          return <SVGBBox key={item.id} bbox={item as IBBoxAnnotationEntity} />;
        }
        if (item.type === AnnotationType.POLYGON) {
          return (
            <SVGPolygon
              key={item.id}
              polygon={item as IPolygonAnnotationEntity}
            />
          );
        }
        if (item.type === AnnotationType.POLYLINE) {
          return (
            <SVGPolyline
              key={item.id}
              polyline={item as IPolylineAnnotationEntity}
            />
          );
        }
        if (item.type === AnnotationType.CIRCLE) {
          return (
            <SVGCircle key={item.id} circle={item as ICircleAnnotationEntity} />
          );
        }
        if (item.type === AnnotationType.ELLIPSE) {
          return (
            <SVGEllipse
              key={item.id}
              ellipse={item as IEllipseAnnotationEntity}
            />
          );
        }
        if (item.type === AnnotationType.LINE) {
          return <SVGLine key={item.id} line={item as ILineAnnotationEntity} />;
        }
        if (item.type === AnnotationType.TEXT) {
          return <SVGText key={item.id} text={item as ITextAnnotationEntity} />;
        }
        return null;
      })}
    </svg>
  );
}

interface SVGImageProps {
  image: IImageEntity;
}
function SVGImage({ image }: SVGImageProps) {
  return <image href={image.src} height={image.height} width={image.width} />;
}

interface SVGPolygonProps {
  polygon: IPolygonAnnotationEntity;
}
function SVGPolygon({ polygon }: SVGPolygonProps) {
  return (
    <polygon
      points={polygon.points.map((item) => `${item.x},${item.y}`).join(' ')}
      fill={polygon.fill}
      stroke={polygon.stroke}
      strokeWidth={polygon.lineWidth}
    />
  );
}

interface SVGPolylineProps {
  polyline: IPolylineAnnotationEntity;
}
function SVGPolyline({ polyline }: SVGPolylineProps) {
  return (
    <polyline
      points={polyline.points.map((item) => `${item.x},${item.y}`).join(' ')}
      fill={polyline.fill}
      stroke={polyline.stroke}
      strokeWidth={polyline.lineWidth}
    />
  );
}

interface SVGBBoxProps {
  bbox: IBBoxAnnotationEntity;
}
function SVGBBox({ bbox }: SVGBBoxProps) {
  return (
    <rect
      width={bbox.width}
      height={bbox.height}
      x={bbox.x}
      y={bbox.y}
      fill={bbox.fill}
      stroke={bbox.stroke}
      strokeWidth={bbox.lineWidth}
    />
  );
}

interface SVGCircleProps {
  circle: ICircleAnnotationEntity;
}
function SVGCircle({ circle }: SVGCircleProps) {
  return (
    <circle
      r={circle.radius}
      cx={circle.x}
      cy={circle.y}
      fill={circle.fill}
      strokeWidth={circle.lineWidth}
    />
  );
}

interface SVGEllipseProps {
  ellipse: IEllipseAnnotationEntity;
}
function SVGEllipse({ ellipse }: SVGEllipseProps) {
  return (
    <ellipse
      rx={ellipse.rx}
      ry={ellipse.ry}
      cx={ellipse.x}
      cy={ellipse.y}
      fill={ellipse.fill}
      strokeWidth={ellipse.lineWidth}
    />
  );
}

interface SVGLineProps {
  line: ILineAnnotationEntity;
}
function SVGLine({ line }: SVGLineProps) {
  return (
    <line
      x1={line.x1}
      y1={line.y1}
      x2={line.x2}
      y2={line.y2}
      fill={line.fill}
      stroke={line.stroke}
      strokeWidth={line.lineWidth}
    />
  );
}

interface SVGTextProps {
  text: ITextAnnotationEntity;
}
function SVGText({ text }: SVGTextProps) {
  return (
    <text x={text.x} y={text.y} fill={text.fill} stroke={text.stroke}>
      {text.text}
    </text>
  );
}

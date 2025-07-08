import { Rectangle2d, ShapeUtil, T, TLBaseShape } from 'tldraw'

export type IToolEdgeShape = TLBaseShape<
	'tool-edge',
	{
		x1: number
		y1: number
		x2: number
		y2: number
		color: string
	}
>

export class ToolEdgeShapeUtil extends ShapeUtil<IToolEdgeShape> {
	static override type = 'tool-edge' as const
	static override props = {
		x1: T.number,
		y1: T.number,
		x2: T.number,
		y2: T.number,
		color: T.string,
	}

	override getDefaultProps(): IToolEdgeShape['props'] {
		return {
			x1: 0,
			y1: 0,
			x2: 100,
			y2: 100,
			color: '#888',
		}
	}

	override canEdit() {
		return true
	}

	override getGeometry(shape: IToolEdgeShape) {
		// 用极窄矩形近似线段
		const minX = Math.min(shape.props.x1, shape.props.x2)
		const minY = Math.min(shape.props.y1, shape.props.y2)
		const w = Math.abs(shape.props.x2 - shape.props.x1) || 1
		const h = Math.abs(shape.props.y2 - shape.props.y1) || 1
		return new Rectangle2d({
			x: minX,
			y: minY,
			width: w,
			height: h,
			isFilled: false,
		})
	}

	override component(shape: IToolEdgeShape) {
		return (
			<svg
				width="100%"
				height="100%"
				style={{ pointerEvents: 'none', position: 'absolute', left: 0, top: 0 }}
			>
				<line
					x1={shape.props.x1}
					y1={shape.props.y1}
					x2={shape.props.x2}
					y2={shape.props.y2}
					stroke={shape.props.color}
					strokeWidth={3}
				/>
			</svg>
		)
	}

	indicator(shape: IToolEdgeShape) {
		return (
			<line
				x1={shape.props.x1}
				y1={shape.props.y1}
				x2={shape.props.x2}
				y2={shape.props.y2}
				stroke="#00f"
				strokeWidth={2}
			/>
		)
	}
}

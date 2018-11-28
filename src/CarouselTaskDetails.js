import React from 'react';
import { 
    Button, 
    Carousel,
	CarouselItem,
	CarouselControl,
	Card,
	CardBody,
	CardTitle,
	CardSubtitle,
	CardFooter,
	CardText,
	Badge
} from 'reactstrap';

import PropTypes from 'prop-types';

import { getContext, getScheduleText } from './TaskHelper'; 

import './CarouselTaskDetails.css';

function getBadgeText(level){
	if(level === 1){
		return 'Done'
	}
	else if(level === 2){
		return 'Soon'
	}
	else{
		return 'Todo'
	}
}

export default class CarouselTaskDetails extends React.Component {
	constructor(props){
		super(props);

		this.state = {
			activeIndex: 0
		}

		this.next = this.next.bind(this);
    	this.previous = this.previous.bind(this);
	}

	next(){
		if(this.props.tasks !== undefined){
			const nextIndex = this.state.activeIndex === this.props.tasks.length - 1 ? 0 : this.state.activeIndex + 1;
			this.props.changeCurrentTask(this.props.tasks[nextIndex]);
		}
	}

	previous(){
		if(this.props.tasks !== undefined){
			const nextIndex = this.state.activeIndex === 0 ? this.props.tasks - 1 : this.state.activeIndex - 1;
			this.props.changeCurrentTask(this.props.tasks[nextIndex]);
		}
	}

	static getDerivedStateFromProps(nextProps, prevState){
		if(nextProps.tasks){
			var activeIndex = nextProps.tasks.findIndex(task => task.id === nextProps.currentTask.id);
			if(prevState.activeIndex !== activeIndex){
				return { 
					activeIndex: activeIndex 
				}
			}
		}
		
		return null;
	}

  	render() {
		const activeIndex = this.state.activeIndex;

		var carouselItems = [];
		if(this.props.tasks){
			carouselItems = this.props.tasks.map((task) => {
				var active = this.props.currentTaskId && this.props.currentTaskId  === task.id;
				var badgeText = getBadgeText(task.level);
				var badgeContext = getContext(task.level);

				var title = getScheduleText(task);

				var descriptionFormatted = task.description.replace(/\n/g,"<br />");

				return(
					<CarouselItem key={task.id} active={active}>
						<Card>
							<CardBody>
								<CardTitle>{task.name} <Badge color={badgeContext} pill>{badgeText}</Badge></CardTitle>
								<CardSubtitle>{title}</CardSubtitle>
								<CardText dangerouslySetInnerHTML={{ __html: descriptionFormatted }}></CardText>
							</CardBody>
							<CardFooter className='pl-5 pr-5'>
								<Button color='primary' className='float-left'>Editer</Button>
								<Button color='primary' className='float-right'>Acquitter</Button>
							</CardFooter>
						</Card>
					</CarouselItem>
				);
			});
		}

		return (
			<Carousel className="p-2 m-2 border border-primary rounded shadow" 
			activeIndex={activeIndex} 
			next={() => {} } 
			previous={() => {} } 
			keyboard={true}
			ride="carousel" 
			interval="5000" 
			slide={false}>
				{carouselItems}
				<CarouselControl direction="prev" directionText="Previous" onClickHandler={this.previous} />
        		<CarouselControl direction="next" directionText="Next" onClickHandler={this.next} />
			</Carousel>
		);
  	}
}

CarouselTaskDetails.propTypes = {
	tasks: PropTypes.array,
	currentTask: PropTypes.object,
	changeCurrentTask: PropTypes.func.isRequired,
};
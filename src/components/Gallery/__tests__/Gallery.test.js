import ignoredMessages from '../../../testHelpers/MockConsole';
import updateWrapper from '../../../testHelpers/EnzymeHelper';

import React from 'react';
import { mount } from 'enzyme';

import localforage from 'localforage';
import imageProxy from '../../../services/ImageProxy';
import Gallery from '../Gallery';

jest.mock('../../../services/ImageProxy');
jest.mock('localforage');

describe('Component Gallery', () =>{
    const parentUiId = "equipment_01";

    const images = [
        {   name: "DJI_1645.JPG",
            parentUiId: parentUiId,
            sizeInByte: 262985,
            thumbnailUrl: "http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876339198thumbnail_DJI_1645.JPG.jpeg",
            url: "http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876339188DJI_1645.JPG.jpeg",
            _uiId: "dfc66510-f5f3-11e9-b3b1-f7086d79fbca"
        },
        {
            name: "DSC_0016.JPG",
            parentUiId: parentUiId,
            sizeInByte: 325323,
            thumbnailUrl: "http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876358072thumbnail_DSC_0016.JPG.jpeg",
            url: "http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876358061DSC_0016.JPG.jpeg",
            _uiId: "eb074110-f5f3-11e9-b3b1-f7086d79fbca"
        },
        {
            name: "DSC_0005.JPG",
            parentUiId: parentUiId,
            sizeInByte: 239719,
            thumbnailUrl: "http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876420022thumbnail_DSC_0005.JPG.jpeg",
            url: "http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876420020DSC_0005.JPG.jpeg",
            _uiId: "0ff4fd50-f5f4-11e9-b3b1-f7086d79fbca"
        },
    ];

    beforeAll(() => {
        ignoredMessages.length = 0;
        ignoredMessages.push("test was not wrapped in act(...)");
        ignoredMessages.push("Please update the following components: ReactImageLightbox");
        ignoredMessages.push("[React Intl] Could not find required `intl` object.");
        ignoredMessages.push("Warning: unstable_flushDiscreteUpdates: Cannot flush updates when React is already rendering.");
        ignoredMessages.push("cssClass");
        ignoredMessages.push('react-html5-camera-photo info');
    });

    beforeEach(() => {
        imageProxy.fetchImages.mockResolvedValue(images);
    });

    afterEach(() => {
        imageProxy.fetchImages.mockRestore();
        imageProxy.deleteImage.mockRestore();
    })

    it('should render a spinner the time to get the answer from the backend', async () => {
        // Arrange
        
        // Act
        const gallery = mount(<Gallery parentUiId={parentUiId} />);
        
        // Assert
        var loading = gallery.find('Loading');
        expect(loading.length).toBe(1);
 
        expect(imageProxy.fetchImages).toHaveBeenCalledTimes(1);
        expect(gallery).toMatchSnapshot();
    });

    it('should render a list of image using the thumbnail url', async () => {
        // Arrange
        
        // Act
        const gallery = mount(<Gallery parentUiId={parentUiId} />);
        await updateWrapper(gallery);
        
        // Assert
        var thumbnails = gallery.find('Memo(Thumbnail)');
        expect(thumbnails.length).toBe(3);
        for(let i = 0; i < 3; i++){
            expect(thumbnails.at(i).props().image).toBe(images[i]);
        }
        
        expect(imageProxy.fetchImages).toHaveBeenCalledTimes(1);
        expect(gallery).toMatchSnapshot();
    });

    it('should render Lightbox when we click on a thumbnail', async() => {
        // Arrange
        const gallery = mount(<Gallery parentUiId={parentUiId} />);
        await updateWrapper(gallery);
       
        // Act
        var galleryComponent = gallery.find('Memo(GalleryComponent)');
        var firstThumbnail = galleryComponent.find('Memo(Thumbnail)').at(0);

        firstThumbnail.find('img').simulate('click');
        
        //Assert
        expect(imageProxy.fetchImages).toHaveBeenCalledTimes(1);
        expect(gallery.find('ReactImageLightbox').length).toBe(1);
        expect(gallery).toMatchSnapshot();
    });

    it('should render with 2 thumbnails since this test delete one image', async() => {
        // Arrange
        imageProxy.deleteImage.mockResolvedValue(images[0])
        
        const gallery = mount(<Gallery parentUiId={parentUiId} />);
        await updateWrapper(gallery);
        
        const galleryComponent = gallery.find('Memo(GalleryComponent)');
        const firstThumbnail = galleryComponent.find('Memo(Thumbnail)').at(0);
        firstThumbnail.find('img').simulate('click');
        
        const imageLightbox = gallery.find('ReactImageLightbox');

        // Act
        imageLightbox.find('Button').at(0).simulate('click');
        await updateWrapper(gallery);

        // Assert
        expect(imageProxy.fetchImages).toHaveBeenCalledTimes(1);
        expect(imageProxy.deleteImage).toHaveBeenCalledTimes(1);
        expect(gallery.find('Memo(GalleryComponent)').find('Memo(Thumbnail)').length).toBe(2);
        expect(gallery).toMatchSnapshot();
    });

    it('should render 0 thumbnails since this test delete all images', async() => {
        // Arrange
        imageProxy.deleteImage.mockImplementation((imageToDelete) => Promise.resolve(imageToDelete));
        
        const gallery = mount(<Gallery parentUiId={parentUiId} />);
        await updateWrapper(gallery);

        const galleryComponent = gallery.find('Memo(GalleryComponent)');
        const firstThumbnail = galleryComponent.find('Memo(Thumbnail)').at(0);
        firstThumbnail.find('img').simulate('click');
        
        const imageLightbox = gallery.find('ReactImageLightbox');

        // Act
        imageLightbox.find('Button').at(0).simulate('click');
        await updateWrapper(gallery);
        imageLightbox.find('Button').at(0).simulate('click');
        await updateWrapper(gallery);
        imageLightbox.find('Button').at(0).simulate('click');
        await updateWrapper(gallery);

        // Assert
        expect(imageProxy.fetchImages).toHaveBeenCalledTimes(1);
        expect(imageProxy.deleteImage).toHaveBeenCalledTimes(3);
        expect(gallery.find('Memo(GalleryComponent)').find('Memo(Thumbnail)').length).toBe(0);
        expect(gallery).toMatchSnapshot();
    });

    it('should render 4 thumbnails since we added an image', async() => {
        // Arrange
        const imageToAdd = {    name: "DJI_1645.JPG",
                                parentUiId: parentUiId,
                                sizeInByte: 262985,
                                thumbnailUrl: "http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876339198thumbnail_DJI_1645.JPG.jpeg",
                                url: "http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876339188DJI_1645.JPG.jpeg",
                                _uiId: "dfc66510-f5f3-11e9-b3b1-f7086d79fbcb"
                            }
        
        const gallery = mount(<Gallery parentUiId={parentUiId} />);
        await updateWrapper(gallery);

        const galleryComponent = gallery.find('Memo(GalleryComponent)');

        // Act
        galleryComponent.props().addImage(imageToAdd);
        await updateWrapper(gallery);

        // Assert
        expect(imageProxy.fetchImages).toHaveBeenCalledTimes(1);
        expect(gallery.find('Memo(GalleryComponent)').find('Memo(Thumbnail)').length).toBe(4);
        expect(gallery.find('ModalEditImage').props().visible).toBe(true);
        expect(gallery).toMatchSnapshot();
    });

    it('should render the Html5Camera when clicking on the camera button in the GalleryComponent', async() => {
        // Arrange
        const gallery = mount(<Gallery parentUiId={parentUiId} />);
        await updateWrapper(gallery);

        const galleryComponent = gallery.find('Memo(GalleryComponent)');
        const cameraButton = galleryComponent.find('Button');

        // Act
        cameraButton.at(1).simulate('click');

        // Assert
        expect(gallery.find('Memo(Html5Camera)').length).toBe(1);
        expect(gallery).toMatchSnapshot();
    });
});
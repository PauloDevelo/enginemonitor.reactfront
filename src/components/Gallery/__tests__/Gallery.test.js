import React from 'react';
import { mount } from 'enzyme';

// eslint-disable-next-line no-unused-vars
import localforage from 'localforage';
import updateWrapper from '../../../testHelpers/EnzymeHelper';
import ignoredMessages from '../../../testHelpers/MockConsole';
import imageProxy from '../../../services/ImageProxy';
import Gallery from '../Gallery';

import storageService from '../../../services/StorageService';

jest.mock('../../../services/ImageProxy');
jest.mock('localforage');
jest.mock('../../../services/StorageService');

describe('Component Gallery', () => {
  const parentUiId = 'equipment_01';

  const images = [
    {
      name: 'DJI_1645.JPG',
      parentUiId,
      sizeInByte: 262985,
      thumbnailUrl: 'http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876339198thumbnail_DJI_1645.JPG.jpeg',
      url: 'http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876339188DJI_1645.JPG.jpeg',
      _uiId: 'dfc66510-f5f3-11e9-b3b1-f7086d79fbca',
    },
    {
      name: 'DSC_0016.JPG',
      parentUiId,
      sizeInByte: 325323,
      thumbnailUrl: 'http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876358072thumbnail_DSC_0016.JPG.jpeg',
      url: 'http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876358061DSC_0016.JPG.jpeg',
      _uiId: 'eb074110-f5f3-11e9-b3b1-f7086d79fbca',
    },
    {
      name: 'DSC_0005.JPG',
      parentUiId,
      sizeInByte: 239719,
      thumbnailUrl: 'http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876420022thumbnail_DSC_0005.JPG.jpeg',
      url: 'http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876420020DSC_0005.JPG.jpeg',
      _uiId: '0ff4fd50-f5f4-11e9-b3b1-f7086d79fbca',
    },
  ];

  beforeAll(() => {
    ignoredMessages.length = 0;
    ignoredMessages.push('test was not wrapped in act(...)');
    ignoredMessages.push('Please update the following components: ReactImageLightbox');
    ignoredMessages.push('[React Intl] Could not find required `intl` object.');
    ignoredMessages.push('Warning: unstable_flushDiscreteUpdates: Cannot flush updates when React is already rendering.');
    ignoredMessages.push('cssClass');
    ignoredMessages.push('react-html5-camera-photo info');
  });

  beforeEach(() => {
    storageService.getUserStorage = jest.fn(() => ({
      getItem: jest.fn(() => Promise.resolve('data:image/jpeg;base64,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')),
      keys: jest.fn(() => Promise.resolve([
        'http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876339198thumbnail_DJI_1645.JPG.jpeg',
        'http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876358072thumbnail_DSC_0016.JPG.jpeg',
        'http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876420022thumbnail_DSC_0005.JPG.jpeg',
      ])),
    }));

    imageProxy.fetchImages.mockResolvedValue(images);
  });

  afterEach(() => {
    imageProxy.fetchImages.mockRestore();
    imageProxy.deleteImage.mockRestore();

    storageService.getUserStorage.mockRestore();
  });

  it('should render a spinner the time to get the answer from the backend', async () => {
    // Arrange

    // Act
    const gallery = mount(<Gallery parentUiId={parentUiId} />);

    // Assert
    const loading = gallery.find('Loading');
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
    const thumbnails = gallery.find('Memo(Thumbnail)');
    expect(thumbnails.length).toBe(3);
    for (let i = 0; i < 3; i++) {
      expect(thumbnails.at(i).props().image).toBe(images[i]);
    }

    expect(imageProxy.fetchImages).toHaveBeenCalledTimes(1);
    expect(gallery).toMatchSnapshot();
  });

  it('should render Lightbox when we click on a thumbnail', async () => {
    // Arrange
    const gallery = mount(<Gallery parentUiId={parentUiId} />);
    await updateWrapper(gallery);

    // Act
    const galleryComponent = gallery.find('Memo(GalleryComponent)');
    const firstThumbnail = galleryComponent.find('Memo(Thumbnail)').at(0);

    firstThumbnail.find('img').simulate('click');

    // Assert
    expect(imageProxy.fetchImages).toHaveBeenCalledTimes(1);
    expect(gallery.find('ReactImageLightbox').length).toBe(1);
    expect(gallery).toMatchSnapshot();
  });

  it('should render with 2 thumbnails since this test delete one image', async () => {
    // Arrange
    imageProxy.deleteImage.mockResolvedValue(images[0]);

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

  it('should render 0 thumbnails since this test delete all images', async () => {
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

  it('should render 4 thumbnails since we added an image', async () => {
    // Arrange
    const imageToAdd = {
      name: 'DJI_1645.JPG',
      parentUiId,
      sizeInByte: 262985,
      thumbnailUrl: 'http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876339198thumbnail_DJI_1645.JPG.jpeg',
      url: 'http://localhost:8000/api/uploads/5d162f2429b0dc049c9c700e/1571876339188DJI_1645.JPG.jpeg',
      _uiId: 'dfc66510-f5f3-11e9-b3b1-f7086d79fbcb',
    };

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

  it('should render the Html5Camera when clicking on the camera button in the GalleryComponent', async () => {
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

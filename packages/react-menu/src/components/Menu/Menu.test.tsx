import { resetIdsForTests } from '@fluentui/react-utilities';
import * as React from 'react';
import { Menu } from './Menu';
import { render, fireEvent } from '@testing-library/react';
import { ReactWrapper } from 'enzyme';
import { isConformant } from '../../common/isConformant';
import { MenuTrigger } from '../MenuTrigger/index';
import { MenuList } from '../MenuList/index';
import { MenuItem } from '../MenuItem/index';
import { MenuItemCheckbox } from '../MenuItemCheckbox/index';
import { MenuItemRadio } from '../MenuItemRadio/index';
import { MenuPopover } from '../MenuPopover/index';

describe('Menu', () => {
  isConformant({
    skipAsPropTests: true,
    disabledTests: ['component-handles-ref', 'component-has-root-ref', 'component-handles-classname'],
    Component: Menu,
    displayName: 'Menu',
    requiredProps: {
      children: [
        <MenuTrigger key="trigger">
          <button>MenuTrigger</button>
        </MenuTrigger>,
        <MenuPopover key="popover">
          <MenuList>
            <MenuItem>Item</MenuItem>
          </MenuList>
        </MenuPopover>,
      ],
    },
  });

  let wrapper: ReactWrapper | undefined;

  afterEach(() => {
    resetIdsForTests();

    if (wrapper) {
      wrapper.unmount();
      wrapper = undefined;
    }
  });

  /**
   * Note: see more visual regression tests for Menu in /apps/vr-tests.
   */
  it('renders a default state', () => {
    const { container } = render(
      <Menu>
        <MenuTrigger>
          <button>Menu trigger</button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem>Item</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>,
    );

    expect(container).toMatchSnapshot();
  });

  it('should open menu by clicking on trigger', () => {
    // Arrange
    const { getByRole } = render(
      <Menu>
        <MenuTrigger>
          <button>Menu trigger</button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem>Item</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>,
    );

    // Act
    fireEvent.click(getByRole('button'));

    // Assert
    getByRole('menu');
  });

  it.each([true, false])('should call onOpenChange when the menu is controlled with open: %s', open => {
    // Arrange
    const onOpenChange = jest.fn();
    const { getByRole } = render(
      <Menu open={open} onOpenChange={onOpenChange}>
        <MenuTrigger>
          <button>Menu trigger</button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem>Item</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>,
    );

    // Act
    fireEvent.click(getByRole('button'));

    // Assert
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(expect.anything(), { open: !open, keyboard: false });
  });

  it('should call onOpenChange when menu is opened and closed', () => {
    // Arrange
    const onOpenChange = jest.fn();
    const { getByRole } = render(
      <Menu onOpenChange={onOpenChange}>
        <MenuTrigger>
          <button>Menu trigger</button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem>Item</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>,
    );

    // Act
    fireEvent.click(getByRole('button'));
    fireEvent.click(getByRole('menuitem'));

    // Assert
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onOpenChange).toHaveBeenNthCalledWith(1, expect.anything(), { open: true, keyboard: false });
    expect(onOpenChange).toHaveBeenNthCalledWith(2, expect.anything(), { open: false, keyboard: false, bubble: true });
  });

  it('should not menu after clicking on a disabled menuitem', () => {
    // Arrange
    const { getByRole, queryByRole } = render(
      <Menu>
        <MenuTrigger>
          <MenuItem disabled>Menu trigger</MenuItem>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem>Item</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>,
    );

    // Act
    fireEvent.click(getByRole('menuitem'));

    // Assert
    expect(queryByRole('menu')).toBeNull();
  });

  it.each([
    ['menuitem', MenuItem],
    ['menuitemradio', MenuItemRadio],
  ])('should close menu after clicking on %s', (role, MenuItemComponent) => {
    // Arrange
    const { getByRole, queryByRole } = render(
      <Menu>
        <MenuTrigger>
          <button>Menu trigger</button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItemComponent>Item</MenuItemComponent>
          </MenuList>
        </MenuPopover>
      </Menu>,
    );

    // Act
    fireEvent.click(getByRole('button'));
    fireEvent.click(getByRole(role));

    // Assert
    expect(queryByRole(role)).toBeNull();
  });

  it.each([
    ['menuitem', MenuItem],
    ['menuitemcheckbox', MenuItemCheckbox],
    ['menuitemradio', MenuItemRadio],
  ])('should not close menu after clicking on a disabled %s', (role, MenuItemComponent) => {
    // Arrange
    const { getByRole } = render(
      <Menu>
        <MenuTrigger>
          <button>Menu trigger</button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItemComponent disabled>Item</MenuItemComponent>
          </MenuList>
        </MenuPopover>
      </Menu>,
    );

    // Act
    fireEvent.click(getByRole('button'));
    fireEvent.click(getByRole(role));

    // Assert
    getByRole(role);
  });

  // THID ONE
  it.each([
    ['menuitemcheckbox', MenuItemCheckbox],
    ['menuitemradio', MenuItemRadio],
  ])('should toggle selection after clicking on %s', (role, MenuItemComponent) => {
    // Arrange
    const { getByRole } = render(
      <Menu open>
        <MenuTrigger>
          <button>Menu trigger</button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItemComponent name="test" value="test">
              Item
            </MenuItemComponent>
          </MenuList>
        </MenuPopover>
      </Menu>,
    );

    // Act
    fireEvent.click(getByRole('button'));
    fireEvent.click(getByRole(role));

    // Assert
    expect(getByRole(role).getAttribute('aria-checked')).toEqual('true');
  });

  it.each([
    ['menuitemcheckbox', MenuItemCheckbox],
    ['menuitemradio', MenuItemRadio],
  ])('should not toggle selection after clicking on disabled %s', (role, MenuItemComponent) => {
    // Arrange
    const { getByRole } = render(
      <Menu>
        <MenuTrigger>
          <button>Menu trigger</button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItemComponent name="test" value="test" disabled>
              Item
            </MenuItemComponent>
          </MenuList>
        </MenuPopover>
      </Menu>,
    );

    // Act
    fireEvent.click(getByRole('button'));
    fireEvent.click(getByRole(role));

    // Assert
    expect(getByRole(role).getAttribute('aria-checked')).toEqual('false');
  });

  it('should persist selection after popup close', () => {
    // Arrange
    const { getByRole } = render(
      <Menu>
        <MenuTrigger>
          <button>Menu trigger</button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItemCheckbox name="test" value="1">
              Item
            </MenuItemCheckbox>
          </MenuList>
        </MenuPopover>
      </Menu>,
    );

    // Act
    fireEvent.click(getByRole('button')); // open menu
    fireEvent.click(getByRole('menuitemcheckbox'));
    fireEvent.click(getByRole('button')); // close menu
    fireEvent.click(getByRole('button')); // open menu

    // Assert
    expect(getByRole('menuitemcheckbox').getAttribute('aria-checked')).toEqual('true');
  });

  it('should open nested menu with mouse enter', () => {
    // Arrange
    const expected = 'visible';
    const { getByRole, getByText } = render(
      <Menu open>
        <MenuTrigger>
          <button>Menu trigger</button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <Menu>
              <MenuTrigger>
                <MenuItem>Item</MenuItem>
              </MenuTrigger>
              <MenuList>
                <MenuItem>{expected}</MenuItem>
              </MenuList>
            </Menu>
          </MenuList>
        </MenuPopover>
      </Menu>,
    );

    // Act
    fireEvent.mouseEnter(getByRole('menuitem'));

    // Assert
    getByText(expected);
  });

  it('should close open nested menu when mouse enters another menuitem', () => {
    // Arrange
    const target = 'target';
    const trigger = 'trigger';
    const invisible = 'invisible';
    const { queryByText, getByText } = render(
      <Menu open>
        <MenuTrigger>
          <button>Menu trigger</button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem>{target}</MenuItem>
            <MenuItem>Item</MenuItem>
            <Menu>
              <MenuTrigger>
                <MenuItem>{trigger}</MenuItem>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem>{invisible}</MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </MenuList>
        </MenuPopover>
      </Menu>,
    );

    // Act
    fireEvent.mouseEnter(getByText(trigger));
    fireEvent.mouseEnter(getByText(target));

    // Assert
    expect(queryByText(invisible)).toBeNull();
  });

  it.each(['Escape', 'ArrowLeft'])('should close open nested menu with %s key', key => {
    // Arrange
    const target = 'target';
    const trigger = 'trigger';
    const invisible = 'invisible';
    const { queryByText, getByText } = render(
      <Menu open>
        <MenuTrigger>
          <button>Menu trigger</button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem>{target}</MenuItem>
            <MenuItem>Item</MenuItem>
            <Menu>
              <MenuTrigger>
                <MenuItem>{trigger}</MenuItem>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem>{invisible}</MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </MenuList>
        </MenuPopover>
      </Menu>,
    );

    // Act
    fireEvent.keyDown(getByText(trigger), { key: 'ArrowRight' });
    fireEvent.keyDown(getByText(invisible), { key });

    // Assert
    expect(queryByText(invisible)).toBeNull();
  });

  it('should not close a root menu with left arrow', () => {
    // Arrange
    const trigger = 'trigger';
    const visible = 'visible';
    const { getByText } = render(
      <Menu open>
        <MenuTrigger>
          <button>{trigger}</button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem>{visible}</MenuItem>
            <MenuItem>Item</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>,
    );

    // Act
    fireEvent.keyDown(getByText(trigger), { key: 'ArrowRight' });
    fireEvent.keyDown(getByText(visible), { key: 'ArrowLeft' });

    // Assert
    getByText(visible);
  });

  it('should open submenu on click', () => {
    // Arrange
    const target = 'target';
    const trigger = 'trigger';
    const visible = 'visible';
    const { getByText } = render(
      <Menu open>
        <MenuTrigger>
          <button>Menu trigger</button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem>{target}</MenuItem>
            <MenuItem>Item</MenuItem>
            <Menu>
              <MenuTrigger>
                <MenuItem>{trigger}</MenuItem>
              </MenuTrigger>
              <MenuList>
                <MenuItem>{visible}</MenuItem>
              </MenuList>
            </Menu>
          </MenuList>
        </MenuPopover>
      </Menu>,
    );

    // Act
    fireEvent.click(getByText(trigger));

    // Assert
    getByText(visible);
  });

  it('should render menu on document.body', () => {
    // Arrange
    const { container } = render(
      <Menu open>
        <MenuTrigger>
          <button>Menu trigger</button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem>Item</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>,
    );

    // Assert
    expect(container.querySelector('[role="menu"]')).toBeNull();
    expect(document.body.querySelector('[role="menu"]')).not.toBeNull();
  });

  it('should render menu inline when configured by prop', () => {
    // Arrange
    const { container } = render(
      <Menu open inline>
        <MenuTrigger>
          <button>Menu trigger</button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem>Item</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>,
    );

    // Assert
    expect(container.querySelector('[role="menu"]')).not.toBeNull();
  });

  it('should render submenus to the same DOM node as root', () => {
    // Arrange
    const outer = 'outer';
    const inner = 'inner';
    const { getByTestId } = render(
      <Menu open>
        <MenuTrigger>
          <button>Menu trigger</button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList data-testid={outer}>
            <MenuItem>Item</MenuItem>
            <Menu open>
              <MenuTrigger>
                <MenuItem>Item</MenuItem>
              </MenuTrigger>
              <MenuList id={inner}>
                <MenuItem>Item</MenuItem>
              </MenuList>
            </Menu>
          </MenuList>
        </MenuPopover>
      </Menu>,
    );

    // Assert
    expect(getByTestId(outer).querySelector(`#${inner}`)).not.toBeNull();
  });
});

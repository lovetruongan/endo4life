import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import { Divider, MenuItem, Select } from '@mui/material';
import { useClickAway, useToggle } from 'ahooks';
import clsx from 'clsx';
import DOMPurify from 'dompurify';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineVideoCamera } from 'react-icons/hi2';
import { PiImage } from 'react-icons/pi';
import { VscArrowRight, VscBook, VscSearch } from 'react-icons/vsc';
import { Link } from 'react-router-dom';
import { ResourceType, useResourcesSearch } from '../../hooks/use-resource-search';
import ResourceTagList from '../resource-tag-list/ResourceTagList';
import styles from './ResourceSearch.module.css';
interface Props {
  defaultValue?: string;
  onChange?(resourceType: ResourceType, val: string): void;
}

export function ResourceSearch({ defaultValue = "", onChange }: Props) {
  const { t } = useTranslation('common');

  const [searchType, setSearchType] = useState<ResourceType>(ResourceType.Image);
  const [open, { setLeft, setRight }] = useToggle(false);
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, loading } = useResourcesSearch(searchType, value);

  useClickAway((evt) => {
    const target = evt.target as HTMLElement;
    if (target && target.id !== "searchInput") {
      setLeft();
    }
  }, containerRef.current);

  const handleClick = () => {
    const value = inputRef.current?.value?.trim();
    onChange && onChange(searchType, value || "");
    setLeft();
  };

  const handleKeyDown = (event: { key: string; }) => {
    if (event.key === "Enter") {
      handleClick();
    } else if (event.key === "Escape") {
      setLeft();
    }
  };

  const handleOnChange = () => {
    setValue(inputRef.current?.value?.trim() ?? "");
    setRight();
  };

  useEffect(() => {
    if (inputRef.current) inputRef.current.value = defaultValue ?? "";
  }, [defaultValue]);

  return (
    <div className={clsx(styles['container'], {
      '-mx-4 sm:-mx-10': true,
    })}>
      <div className="relative">
        <div
          className="relative bg-black bg-center bg-cover h-60 bg-opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), url("/images/background-search.png")`,
          }}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative flex items-center w-11/12 max-w-3xl px-2 py-2 bg-white shadow-md rounded-xl sm:px-4 sm:w-4/5">
              <div className="flex items-center w-full">
                {searchType === ResourceType.Image && <PiImage size={24} className="flex-none text-gray-500 pb-0.5" />}
                {searchType === ResourceType.Video && <HiOutlineVideoCamera size={24} className="flex-none text-gray-500 pb-0.5" />}
                {searchType === ResourceType.Course && <VscBook size={24} className="flex-none text-gray-500 pb-0.5" />}
                <Select
                  id="select-resource-type"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as ResourceType)}
                  className='w-24 ml-2 border-none'
                  variant='standard'
                  disableUnderline
                >
                  <MenuItem value={ResourceType.Image}>{t('navigation.txtMenuItemImage')}</MenuItem>
                  <MenuItem value={ResourceType.Video}>{t('navigation.txtMenuItemVideo')}</MenuItem>
                  <MenuItem value={ResourceType.Course}>{t('navigation.txtMenuItemCourse')}</MenuItem>
                </Select>

                <Divider orientation="vertical" flexItem />

                <div className='flex items-center justify-between w-full'>
                  <input
                    id="searchInput"
                    ref={inputRef}
                    type="search"
                    placeholder={t("txtSearch")}
                    onChange={handleOnChange}
                    onKeyDown={handleKeyDown}
                    className="flex-grow w-11/12 px-2 py-2 text-gray-700 outline-none sm:px-4"
                  />

                  <button title="view-all-click" onClick={handleClick} className="text-gray-500 hover:text-gray-700">
                    <VscSearch />
                  </button>
                </div>

              </div>
              <div
                ref={containerRef}
                className={clsx(
                  "absolute left-0 top-full z-10 mt-1 w-full rounded border bg-white shadow",
                  {
                    hidden: !open,
                    block: open,
                  },
                )}
                style={{ maxHeight: "60vh", overflowY: "auto" }}
              >
                {loading && <LoadingSkeleton />}

                {!loading && searchType === ResourceType.Image && data?.map((resource) => (
                  <Link to={STUDENT_WEB_ROUTES.RESOURCE_IMAGE.replace(':id', resource.id)} key={resource.id} className="flex items-center gap-4 px-4 py-3">
                    <div className="flex items-center justify-center flex-none bg-gray-200 rounded-lg w-14 h-14">
                      <PiImage size={32} color='gray' />
                    </div>
                    <div>
                      <div className="mb-1 text-lg font-medium">{resource.title}</div>
                      <div className='flex flex-wrap gap-2'>
                        {'tag' in resource && (
                          <ResourceTagList
                            tags={resource.tag}
                            detailTags={resource.detailTag}
                          />
                        )}
                      </div>
                      {'description' in resource && (
                        <div className="text-gray-500">{resource.description}</div>
                      )}
                    </div>
                  </Link>
                ))}
                {!loading && searchType === ResourceType.Video && data?.map((resource) => (
                  <Link to={STUDENT_WEB_ROUTES.RESOURCE_VIDEO.replace(':id', resource.id)} key={resource.id} className="flex items-center gap-4 px-4 py-3">
                    <div className="flex items-center justify-center flex-none bg-gray-200 rounded-lg w-14 h-14">
                      <HiOutlineVideoCamera size={32} color='gray' />
                    </div>
                    <div>
                      <div className="mb-1 text-lg font-medium">{resource.title}</div>
                      <div className='flex flex-wrap gap-2'>
                        {'tag' in resource && (
                          <ResourceTagList
                            tags={resource.tag}
                            detailTags={resource.detailTag}
                          />
                        )}
                      </div>
                      {'description' in resource && (
                        <div className="text-gray-500">{resource.description}</div>
                      )}
                    </div>
                  </Link>
                ))}
                {!loading && searchType === ResourceType.Course && data?.map((resource) => (
                  <Link to={STUDENT_WEB_ROUTES.RESOURCE_COURSE.replace(':id', resource.id)} key={resource.id} className="flex items-center gap-4 px-4 py-3">
                    <div className="flex items-center justify-center flex-none bg-gray-200 rounded-lg w-14 h-14">
                      <VscBook size={32} color='gray' />
                    </div>
                    <div>
                      <div className="text-lg font-medium">{resource.title}</div>
                    </div>
                  </Link>
                ))}

                {!loading && data && data.length === 0 &&
                  <NoSearchResult text={t("txtNoSearchResults", { search: value })} />
                }

                <div onClick={handleClick} className="flex items-center gap-1 p-4 text-blue-600 transition-all cursor-pointer hover:gap-2 hover:text-blue-900">
                  <span>{t('txtViewAll')}</span>
                  <VscArrowRight />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="px-4">
    {[...Array(4)].map((_, i) => (
      <ResourceSearchSkeleton key={i} />
    ))}
  </div>
);
const ResourceSearchSkeleton = () => {
  return (
    <div className="px-4 py-3 my-4 rounded cursor-pointer bg-slate-50">
      <div className="h-4 font-medium w-60 bg-slate-200 bg-gradient-to-t"></div>
      <div className="flex flex-wrap gap-1 mt-2 text-sm text-slate-500">
        <span className="w-32 h-3 bg-slate-100"></span>
        <span className="w-20 h-3 bg-slate-100"></span>
        <span className="w-20 h-3 bg-slate-100"></span>
      </div>
    </div>
  );
}

const NoSearchResult = ({ text }: { text: string }) => (
  <div className="p-4 text-center">
    <div
      className="p-4 text-center"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(text),
      }}
    />
  </div>
);

export default ResourceSearch;
